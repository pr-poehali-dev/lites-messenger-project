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

  const [chats, setChats] = useState<Chat[]>([
    { id: 1, name: 'Александр Иванов', avatar: '😊', lastMessage: 'Привет! Как дела?', time: '14:32', type: 'personal' },
    { id: 2, name: 'Мария Петрова', avatar: '🎨', lastMessage: 'Отправил файлы', time: '13:15', unread: 2, type: 'personal' },
    { id: 3, name: 'Команда Разработки', avatar: '🚀', lastMessage: 'Встреча в 15:00', time: '12:48', unread: 5, type: 'group', members: 12 },
  ]);

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
                    <Button variant="ghost" size="icon">
                      <Icon name="MessageSquare" size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="calls" className="flex-1 p-4 m-0">
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="PhoneCall" size={48} className="mx-auto mb-4 opacity-50" />
              <p>История звонков пуста</p>
            </div>
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
    </div>
  );
}