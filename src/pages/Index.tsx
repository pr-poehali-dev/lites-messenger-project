import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

type RegistrationStep = 'phone' | 'avatar' | 'nickname' | 'complete';
type Section = 'chats' | 'contacts' | 'calls' | 'profile' | 'settings' | 'bots' | 'payments';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  type?: 'personal' | 'group' | 'channel';
  members?: number;
  description?: string;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  username: string;
}

interface Call {
  id: number;
  contactId: number;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'voice' | 'video';
  duration?: string;
  time: string;
}

const EMOJI_AVATARS = ['😊', '😎', '🚀', '🎨', '🎮', '🎵', '⚡', '🌟', '🔥', '💎', '🦄', '🐱', '🐶', '🐼'];

export default function Index() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [currentSection, setCurrentSection] = useState<Section>('chats');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([]);

  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: 'Александр Иванов', avatar: '😊', username: '@alex_ivanov' },
    { id: 2, name: 'Мария Петрова', avatar: '🎨', username: '@maria_pet' },
    { id: 3, name: 'Иван Сидоров', avatar: '🎮', username: '@ivan_sid' },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createType, setCreateType] = useState<'group' | 'channel'>('group');
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [isInCall, setIsInCall] = useState(false);
  const [activeCall, setActiveCall] = useState<{ contactId: number; type: 'voice' | 'video' } | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Привет! Как дела?', sender: 'other', time: '14:30' },
    { id: 2, text: 'Отлично! А у тебя?', sender: 'me', time: '14:31' },
    { id: 3, text: 'Тоже хорошо, спасибо!', sender: 'other', time: '14:32' },
  ]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInCall]);

  const handlePhoneSubmit = () => {
    if (phoneNumber.length >= 10) {
      setRegistrationStep('avatar');
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setRegistrationStep('nickname');
  };

  const handleNicknameSubmit = () => {
    if (nickname && username) {
      setRegistrationStep('complete');
      setTimeout(() => {
        setIsRegistered(true);
      }, 1500);
    }
  };

  const handleCreateGroupOrChannel = () => {
    if (createName && selectedContacts.length > 0) {
      const newChat: Chat = {
        id: chats.length + 1,
        name: createName,
        avatar: createType === 'group' ? '👥' : '📢',
        lastMessage: createType === 'group' ? 'Группа создана' : 'Канал создан',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        type: createType,
        members: selectedContacts.length + 1,
        description: createDescription,
      };
      setChats([newChat, ...chats]);
      setIsCreateDialogOpen(false);
      setCreateName('');
      setCreateDescription('');
      setSelectedContacts([]);
    }
  };

  const toggleContactSelection = (contactId: number) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const startCall = (contactId: number, type: 'voice' | 'video') => {
    setActiveCall({ contactId, type });
    setIsInCall(true);
  };

  const endCall = () => {
    if (activeCall) {
      const newCall: Call = {
        id: calls.length + 1,
        contactId: activeCall.contactId,
        type: 'outgoing',
        callType: activeCall.type,
        duration: formatDuration(callDuration),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setCalls([newCall, ...calls]);
    }
    setIsInCall(false);
    setActiveCall(null);
    setCallDuration(0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: messageText,
        sender: 'me',
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
      
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyMessage: Message = {
          id: messages.length + 2,
          text: 'Сообщение получено! 👍',
          sender: 'other',
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, replyMessage]);
      }, 2000);
    }
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary p-4">
        <Card className="w-full max-w-md p-8 animate-scale-in backdrop-blur-lg bg-white/95 dark:bg-gray-900/95">
          {registrationStep === 'phone' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="text-5xl mb-4">💬</div>
                <h1 className="text-3xl font-bold">Lites</h1>
                <p className="text-muted-foreground">Защищённый мессенджер</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Номер телефона</label>
                  <Input
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <Button 
                  onClick={handlePhoneSubmit} 
                  className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
                  size="lg"
                >
                  Продолжить
                </Button>
              </div>
            </div>
          )}

          {registrationStep === 'avatar' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Выберите аватар</h2>
                <p className="text-muted-foreground">Эмодзи или загрузите фото</p>
              </div>
              <div className="grid grid-cols-7 gap-3">
                {EMOJI_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleAvatarSelect(emoji)}
                    className="text-4xl hover:scale-125 transition-transform duration-200 p-2 rounded-lg hover:bg-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <Button variant="outline" className="w-full" size="lg">
                <Icon name="Upload" className="mr-2" size={20} />
                Загрузить фото
              </Button>
            </div>
          )}

          {registrationStep === 'nickname' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="text-6xl mb-4">{selectedAvatar}</div>
                <h2 className="text-2xl font-bold">Представьтесь</h2>
                <p className="text-muted-foreground">Создайте свой профиль</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Никнейм</label>
                  <Input
                    placeholder="Иван Иванов"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input
                    placeholder="@username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <Button 
                  onClick={handleNicknameSubmit} 
                  className="w-full gradient-accent text-white hover:opacity-90 transition-opacity"
                  size="lg"
                >
                  Создать профиль
                </Button>
              </div>
            </div>
          )}

          {registrationStep === 'complete' && (
            <div className="text-center space-y-6 animate-scale-in">
              <div className="text-7xl mb-4">✨</div>
              <h2 className="text-3xl font-bold">Добро пожаловать!</h2>
              <p className="text-muted-foreground">Ваш профиль создан</p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-border flex flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between backdrop-blur-md bg-card/80">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="text-2xl">{selectedAvatar}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{nickname}</h2>
              <p className="text-xs text-muted-foreground">{username}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
            <Icon name={isDarkMode ? 'Sun' : 'Moon'} size={20} />
          </Button>
        </div>

        <Tabs value={currentSection} onValueChange={(v) => setCurrentSection(v as Section)} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-4 gap-1 p-2">
            <TabsTrigger value="chats" className="text-xs">
              <Icon name="MessageSquare" size={16} />
            </TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs">
              <Icon name="Users" size={16} />
            </TabsTrigger>
            <TabsTrigger value="calls" className="text-xs">
              <Icon name="Phone" size={16} />
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs">
              <Icon name="User" size={16} />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="flex-1 m-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedChat === chat.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="text-2xl">{chat.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{chat.name}</p>
                          {chat.type === 'group' && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              <Icon name="Users" size={12} className="mr-1" />
                              {chat.members}
                            </Badge>
                          )}
                          {chat.type === 'channel' && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              <Icon name="Radio" size={12} className="mr-1" />
                              Канал
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        {chat.unread && (
                          <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="contacts" className="flex-1 m-0">
            <ScrollArea className="h-[calc(100vh-180px)]">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="text-2xl">{contact.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.username}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startCall(contact.id, 'voice')}>
                        <Icon name="Phone" size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => startCall(contact.id, 'video')}>
                        <Icon name="Video" size={18} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon name="MessageSquare" size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="calls" className="flex-1 m-0">
            {calls.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="PhoneCall" size={48} className="mx-auto mb-4 opacity-50" />
                <p>История звонков пуста</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-180px)]">
                {calls.map((call) => {
                  const contact = contacts.find(c => c.id === call.contactId);
                  if (!contact) return null;
                  return (
                    <div key={call.id} className="p-4 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="text-2xl">{contact.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{contact.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon 
                              name={call.type === 'incoming' ? 'PhoneIncoming' : call.type === 'outgoing' ? 'PhoneOutgoing' : 'PhoneMissed'} 
                              size={14} 
                              className={call.type === 'missed' ? 'text-destructive' : ''}
                            />
                            <span>{call.callType === 'video' ? 'Видеозвонок' : 'Звонок'}</span>
                            {call.duration && <span>• {call.duration}</span>}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{call.time}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => startCall(contact.id, call.callType)}
                        >
                          <Icon name={call.callType === 'video' ? 'Video' : 'Phone'} size={18} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="profile" className="flex-1 p-4 m-0 space-y-4">
            <Card className="p-6 text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarFallback className="text-5xl">{selectedAvatar}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{nickname}</h3>
                <p className="text-muted-foreground">{username}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Сообщений</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Звонков</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Контактов</p>
                </div>
              </div>
            </Card>
            <Button className="w-full gradient-accent text-white">
              <Icon name="Crown" className="mr-2" size={20} />
              Premium за 350₽/месяц
            </Button>
          </TabsContent>
        </Tabs>

        <div className="p-2 border-t border-border grid grid-cols-4 gap-1">
          <Button variant={currentSection === 'settings' ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentSection('settings')}>
            <Icon name="Settings" size={18} />
          </Button>
          <Button variant={currentSection === 'bots' ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentSection('bots')}>
            <Icon name="Bot" size={18} />
          </Button>
          <Button variant={currentSection === 'payments' ? 'secondary' : 'ghost'} size="sm" onClick={() => setCurrentSection('payments')}>
            <Icon name="CreditCard" size={18} />
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Icon name="Plus" size={18} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Создать группу или канал</DialogTitle>
                <DialogDescription>
                  Выберите тип, добавьте участников и заполните информацию
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label>Тип</Label>
                  <RadioGroup value={createType} onValueChange={(v) => setCreateType(v as 'group' | 'channel')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="group" id="group" />
                      <Label htmlFor="group" className="flex items-center gap-2 cursor-pointer">
                        <Icon name="Users" size={18} />
                        Группа
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="channel" id="channel" />
                      <Label htmlFor="channel" className="flex items-center gap-2 cursor-pointer">
                        <Icon name="Radio" size={18} />
                        Канал
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    placeholder={createType === 'group' ? 'Название группы' : 'Название канала'}
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Описание (опционально)</Label>
                  <Textarea
                    placeholder="Опишите группу или канал..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Участники ({selectedContacts.length} выбрано)</Label>
                  <ScrollArea className="h-48 border rounded-lg p-2">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        onClick={() => toggleContactSelection(contact.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                          selectedContacts.includes(contact.id) ? 'bg-primary/10 border border-primary' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-lg">{contact.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">{contact.username}</p>
                          </div>
                          {selectedContacts.includes(contact.id) && (
                            <Icon name="Check" size={18} className="text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                <Button 
                  onClick={handleCreateGroupOrChannel}
                  disabled={!createName || selectedContacts.length === 0}
                  className="w-full gradient-primary text-white"
                >
                  Создать {createType === 'group' ? 'группу' : 'канал'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border backdrop-blur-md bg-card/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChat(null)}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <Avatar>
                <AvatarFallback className="text-2xl">{chats.find(c => c.id === selectedChat)?.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{chats.find(c => c.id === selectedChat)?.name}</p>
                <p className="text-xs text-muted-foreground">онлайн</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Icon name="Phone" size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="Video" size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="MoreVertical" size={20} />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.sender === 'me'
                      ? 'gradient-primary text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <div className="typing-indicator flex space-x-1">
                    <span className="w-2 h-2 bg-foreground rounded-full"></span>
                    <span className="w-2 h-2 bg-foreground rounded-full"></span>
                    <span className="w-2 h-2 bg-foreground rounded-full"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 border-t border-border backdrop-blur-md bg-card/80">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Icon name="Paperclip" size={20} />
              </Button>
              <Input
                placeholder="Сообщение..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <Icon name="Smile" size={20} />
              </Button>
              <Button 
                onClick={handleSendMessage}
                className="gradient-primary text-white hover:opacity-90 transition-opacity"
                size="icon"
              >
                <Icon name="Send" size={20} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center space-y-4">
            <Icon name="MessageSquare" size={64} className="mx-auto opacity-50" />
            <p className="text-xl">Выберите чат для начала общения</p>
          </div>
        </div>
      )}

      {isInCall && activeCall && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex items-center justify-center animate-fade-in">
          <Card className="w-full max-w-md p-8 text-center space-y-6">
            <div className="space-y-4">
              <Avatar className="w-32 h-32 mx-auto">
                <AvatarFallback className="text-6xl">
                  {contacts.find(c => c.id === activeCall.contactId)?.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  {contacts.find(c => c.id === activeCall.contactId)?.name}
                </h2>
                <p className="text-muted-foreground">
                  {activeCall.type === 'video' ? 'Видеозвонок' : 'Голосовой звонок'}
                </p>
              </div>
              <div className="text-3xl font-mono text-primary">
                {formatDuration(callDuration)}
              </div>
            </div>

            {activeCall.type === 'video' && (
              <div className="relative w-full aspect-video bg-muted rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="Video" size={48} className="opacity-30" />
                  <p className="absolute bottom-4 text-sm text-muted-foreground">
                    Видео активно
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="w-14 h-14 rounded-full"
              >
                <Icon name="Mic" size={24} />
              </Button>
              
              {activeCall.type === 'video' && (
                <Button
                  variant="outline"
                  size="icon"
                  className="w-14 h-14 rounded-full"
                >
                  <Icon name="Video" size={24} />
                </Button>
              )}

              <Button
                variant="destructive"
                size="icon"
                className="w-16 h-16 rounded-full"
                onClick={endCall}
              >
                <Icon name="PhoneOff" size={28} />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="w-14 h-14 rounded-full"
              >
                <Icon name="Volume2" size={24} />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              🔒 Защищённое соединение
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}