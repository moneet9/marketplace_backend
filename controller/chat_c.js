import Chat from '../model/Chat.js';
import User from '../model/User.js';

// ---------------- SEND MESSAGE ----------------
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver ID and message are required' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const chat = await Chat.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
    });

    // Populate sender and receiver details
    await chat.populate('sender', 'name email phone');
    await chat.populate('receiver', 'name email phone');

    res.status(201).json({
      message: 'Message sent successfully',
      chat,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET CHAT HISTORY (Between two users) ----------------
export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Get all messages between current user and the specified user
    const chats = await Chat.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .populate('sender', 'name email phone')
      .populate('receiver', 'name email phone')
      .sort({ createdAt: 1 });

    // Mark messages as read if they are for current user
    await Chat.updateMany(
      { receiver: req.user._id, sender: userId, read: false },
      { read: true }
    );

    res.json({ messages: chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- GET ALL CONVERSATIONS ----------------
export const getConversations = async (req, res) => {
  try {
    // Get all unique users the current user has chatted with
    const chats = await Chat.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email phone')
      .populate('receiver', 'name email phone');

    // Get unique user conversations
    const conversationsMap = new Map();

    chats.forEach((chat) => {
      const otherUser = chat.sender._id.toString() === req.user._id.toString() ? chat.receiver : chat.sender;
      const key = otherUser._id.toString();

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          user: otherUser,
          lastMessage: chat.message,
          timestamp: chat.createdAt,
          unreadCount: 0,
        });
      }
    });

    // Count unread messages
    const unreadChats = await Chat.find({
      receiver: req.user._id,
      read: false,
    });

    unreadChats.forEach((chat) => {
      const key = chat.sender.toString();
      if (conversationsMap.has(key)) {
        conversationsMap.get(key).unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- MARK MESSAGES AS READ ----------------
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    await Chat.updateMany(
      { receiver: req.user._id, sender: userId, read: false },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
