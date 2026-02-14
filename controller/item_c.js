import Item from '../model/Item.js';

// ---------------- CREATE ITEM ----------------
export const createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      era,
      listingType,
      price,
      startingBid,
      bidIncrement,
      duration,
      location,
      images,
    } = req.body;

    if (!title || !description || !category || !condition || !listingType || !location) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Calculate auction end date if auction type
    let auctionEndDate = null;
    if (listingType === 'auction' && duration) {
      auctionEndDate = new Date();
      auctionEndDate.setDate(auctionEndDate.getDate() + parseInt(duration));
    }

    // Process images (base64 to Buffer)
    const processedImages = images?.map((img) => {
      const base64Data = img.data.replace(/^data:image\/\w+;base64,/, '');
      return {
        data: Buffer.from(base64Data, 'base64'),
        contentType: img.contentType || 'image/jpeg',
        filename: img.filename || `image_${Date.now()}.jpg`,
      };
    }) || [];

    const item = await Item.create({
      sellerId: req.user._id,
      title,
      description,
      category,
      condition,
      era,
      listingType,
      price: listingType === 'fixed' ? price : undefined,
      startingBid: listingType === 'auction' ? startingBid : undefined,
      bidIncrement: listingType === 'auction' ? (bidIncrement || 1000) : undefined,
      currentBid: listingType === 'auction' ? startingBid : undefined,
      auctionEndDate,
      location,
      images: processedImages,
      status: 'active',
    });

    res.status(201).json({
      message: 'Item listed successfully',
      item: {
        id: item._id,
        title: item.title,
        listingType: item.listingType,
        status: item.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET ALL ITEMS ----------------
export const getAllItems = async (req, res) => {
  try {
    const { category, listingType, status, search } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (listingType) filter.listingType = listingType;
    if (status) filter.status = status;
    else filter.status = 'active'; // Default to active items

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Item.find(filter)
      .populate('sellerId', 'name email phone')
      .sort({ createdAt: -1 });

    // Convert images to base64 for frontend
    const itemsWithImages = items.map((item) => {
      const plainItem = item.toObject();
      plainItem.images = plainItem.images.map((img) => ({
        data: `data:${img.contentType};base64,${img.data.toString('base64')}`,
        contentType: img.contentType,
        filename: img.filename,
      }));
      return plainItem;
    });

    res.json({ items: itemsWithImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET ITEM BY ID ----------------
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('sellerId', 'name email phone');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment views
    item.views += 1;
    await item.save();

    // Convert images to base64
    const plainItem = item.toObject();
    plainItem.images = plainItem.images.map((img) => ({
      data: `data:${img.contentType};base64,${img.data.toString('base64')}`,
      contentType: img.contentType,
      filename: img.filename,
    }));

    res.json({ item: plainItem });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET MY ITEMS ----------------
export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ sellerId: req.user._id })
      .populate('highestBidderId', 'name email')
      .sort({ createdAt: -1 });

    // Convert images to base64
    const itemsWithImages = items.map((item) => {
      const plainItem = item.toObject();
      plainItem.images = plainItem.images.map((img) => ({
        data: `data:${img.contentType};base64,${img.data.toString('base64')}`,
        contentType: img.contentType,
        filename: img.filename,
      }));
      return plainItem;
    });

    res.json({ items: itemsWithImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- UPDATE ITEM ----------------
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the seller
    if (item.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      item[key] = updates[key];
    });

    await item.save();

    res.json({ message: 'Item updated successfully', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- MARK AS SOLD ----------------
export const markAsSold = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the seller
    if (item.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    item.status = 'sold';
    await item.save();

    res.json({ message: 'Item marked as sold', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- DELETE ITEM ----------------
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the seller
    if (item.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- PLACE BID ----------------
export const placeBid = async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const itemId = req.params.id;

    if (!bidAmount) {
      return res.status(400).json({ message: 'Bid amount is required' });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.listingType !== 'auction') {
      return res.status(400).json({ message: 'This item is not an auction' });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ message: 'This auction is not active' });
    }

    // Check if bid is higher than current bid
    const bidIncrement = item.bidIncrement || 1000;
    const minimumBid = item.currentBid ? item.currentBid + bidIncrement : item.startingBid;
    if (bidAmount < minimumBid) {
      return res.status(400).json({
        message: `Bid must be at least ₹${minimumBid}`,
        minimumBid,
        bidIncrement,
      });
    }

    // Update the current bid and highest bidder
    item.currentBid = bidAmount;
    item.highestBidderId = req.user._id;
    item.bidCount = (item.bidCount || 0) + 1;
    await item.save();

    res.json({
      message: 'Bid placed successfully',
      item: {
        _id: item._id,
        title: item.title,
        currentBid: item.currentBid,
        status: item.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET MY BIDS ----------------
export const getMyBids = async (req, res) => {
  try {
    const items = await Item.find({
      highestBidderId: req.user._id,
      listingType: 'auction',
      status: 'active',
    })
      .populate('sellerId', 'name email phone')
      .sort({ auctionEndDate: 1 });

    // Convert images to base64
    const itemsWithImages = items.map((item) => {
      const plainItem = item.toObject();
      plainItem.images = plainItem.images.map((img) => ({
        data: `data:${img.contentType};base64,${img.data.toString('base64')}`,
        contentType: img.contentType,
        filename: img.filename,
      }));
      return plainItem;
    });

    res.json({ bids: itemsWithImages, count: itemsWithImages.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
