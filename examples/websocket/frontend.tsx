'use client';

import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  LogOut, 
  Users, 
  Wifi, 
  WifiOff, 
  MessageCircle,
  User,
  Clock
} from 'lucide-react';

type User = {
  id: string;
  username: string;
}

type Message = {
  id: string;
  username: string;
  content: string;
  timestamp: Date | string;
  type: 'user' | 'system';
}

export default function SocketDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to websocket server
    // Never use PORT in the URL, always use XTransformPort
    // DO NOT change the path, it is used by Caddy to forward the request to the correct port
    const socketInstance = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error: Error) => {
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socketInstance.on('message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socketInstance.on('user-joined', (data: { user: User; message: Message }) => {
      setMessages(prev => [...prev, data.message]);
      setUsers(prev => {
        if (!prev.find(u => u.id === data.user.id)) {
          return [...prev, data.user];
        }
        return prev;
      });
    });

    socketInstance.on('user-left', (data: { user: User; message: Message }) => {
      setMessages(prev => [...prev, data.message]);
      setUsers(prev => prev.filter(u => u.id !== data.user.id));
    });

    socketInstance.on('users-list', (data: { users: User[] }) => {
      setUsers(data.users);
    });

    socketInstance.on('user-typing', (data: { username: string }) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    });

    socketInstance.on('user-stop-typing', (data: { username: string }) => {
      setTypingUsers(prev => prev.filter(u => u !== data.username));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleJoin = () => {
    if (socket && username.trim() && isConnected) {
      socket.emit('join', { username: username.trim() });
      setIsUsernameSet(true);
    }
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit('leave', { username: username.trim() });
      setIsUsernameSet(false);
      setMessages([]);
      setUsers([]);
      setUsername('');
    }
  };

  const sendMessage = () => {
    if (socket && inputMessage.trim() && username.trim()) {
      socket.emit('message', {
        content: inputMessage.trim(),
        username: username.trim()
      });
      setInputMessage('');
      
      // Stop typing indicator
      socket.emit('stop-typing', { username: username.trim() });
      setIsTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    
    // Handle typing indicator
    if (socket && username.trim()) {
      if (!isTyping && e.target.value.trim()) {
        socket.emit('typing', { username: username.trim() });
        setIsTyping(true);
      }
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop-typing', { username: username.trim() });
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleUsernameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  const formatTime = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Chat Area */}
        <div className="md:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <CardTitle>WebSocket Chat</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {isUsernameSet && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {username}
                    </Badge>
                  )}
                  <Badge 
                    variant={isConnected ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {isConnected ? (
                      <>
                        <Wifi className="h-3 w-3" />
                        Connected
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3" />
                        Disconnected
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              {connectionError && (
                <p className="text-sm text-red-500 mt-2">
                  Connection error: {connectionError}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {!isUsernameSet ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="w-full max-w-sm space-y-4">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold">Welcome to Chat</h3>
                      <p className="text-sm text-gray-500">Enter a username to join the conversation</p>
                    </div>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={handleUsernameKeyDown}
                      placeholder="Enter your username..."
                      disabled={!isConnected}
                      className="w-full"
                    />
                    <Button
                      onClick={handleJoin}
                      disabled={!isConnected || !username.trim()}
                      className="w-full"
                    >
                      Join Chat
                    </Button>
                    {!isConnected && (
                      <p className="text-sm text-amber-600 text-center">
                        Waiting for connection...
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                          <MessageCircle className="h-12 w-12 mb-2 text-gray-300" />
                          <p>No messages yet</p>
                          <p className="text-sm">Be the first to say something!</p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div 
                            key={msg.id} 
                            className={`flex ${msg.type === 'system' ? 'justify-center' : msg.username === username ? 'justify-end' : 'justify-start'}`}
                          >
                            {msg.type === 'system' ? (
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-1">
                                <p className="text-sm text-gray-500 italic">
                                  {msg.content}
                                </p>
                              </div>
                            ) : (
                              <div 
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                  msg.username === username 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 dark:bg-gray-800'
                                }`}
                              >
                                {msg.username !== username && (
                                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                                    {msg.username}
                                  </p>
                                )}
                                <p className={msg.username === username ? 'text-white' : 'text-gray-900 dark:text-gray-100'}>
                                  {msg.content}
                                </p>
                                <div className={`flex items-center gap-1 mt-1 ${msg.username === username ? 'justify-end' : 'justify-start'}`}>
                                  <Clock className={`h-3 w-3 ${msg.username === username ? 'text-blue-200' : 'text-gray-400'}`} />
                                  <span className={`text-xs ${msg.username === username ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {formatTime(msg.timestamp)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Typing Indicator */}
                  {typingUsers.length > 0 && (
                    <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-500 italic">
                        {typingUsers.length === 1 
                          ? `${typingUsers[0]} is typing...`
                          : `${typingUsers.join(', ')} are typing...`
                        }
                      </p>
                    </div>
                  )}

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={!isConnected}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!isConnected || !inputMessage.trim()}
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleLeave}
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users Sidebar */}
        <div className="md:col-span-1">
          <Card className="h-[600px]">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Online Users
                <Badge variant="secondary" className="ml-auto">
                  {users.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500 p-4">
                    <Users className="h-8 w-8 mb-2 text-gray-300" />
                    <p className="text-sm text-center">No users online</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {users.map((user) => (
                      <div 
                        key={user.id}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          user.username === username 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.username}
                            {user.username === username && (
                              <span className="text-xs text-gray-500 ml-1">(you)</span>
                            )}
                          </p>
                          {typingUsers.includes(user.username) && (
                            <p className="text-xs text-gray-500 italic">typing...</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}