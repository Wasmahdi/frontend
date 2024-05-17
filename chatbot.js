(function() {
    const frontend_url = 'https://frontend-woad-tau.vercel.app';
    const backend_url = 'https://backend-wgh5.vercel.app';
    const backend_token = '7yr82hwerwehfbwy94rkjbwef975b32497897243hbsbjkdshbqhwoiuqerbhf';

    fetch(`${backend_url}/v1/chatbot/settings`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'x-author': backend_token
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success === false) {
                return;
            }

            let initialMessage = data.data.frontend.initial_message;
            let chatbot_name = data.data.frontend.chatbot_name;

            function addCssLink() {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = frontend_url + '/chatbot.css';
                document.head.appendChild(link);
            }

            function createElement(elementType, attributes = {}, content = "") {
                const element = document.createElement(elementType);
                for (const key in attributes) {
                    if (attributes.hasOwnProperty(key)) {
                        element.setAttribute(key, attributes[key]);
                    }
                }

                if (content.startsWith('http') || content.startsWith('data:image')) {
                    const image = document.createElement('img');
                    image.src = content;
                    element.appendChild(image);
                } else {
                    element.textContent = content;
                }

                return element;
            }

            addCssLink();

            const widgetContainer = createElement('div', {class: 'widget-container'});
            const chatButton = createElement('button', {
                id: 'chatButton',
                class: 'widget-button'
            });
            const chatbotContainer = createElement('div', {
                id: 'chatbot',
                class: 'widget'
            });
            const chatHeader = createElement('div', {class: 'chat-header'});
            const chatAvatar = createElement('div', {class: 'chat-avatar'});
            const chatbotName = createElement('span', {class: 'chatbot-name'}, chatbot_name);
            const MessagesContainer = createElement('div', {id: 'chatMessagesContainer'});
            const chatMessages = createElement('ul', {id: 'chatMessages'});
            const chatInput = createElement('div', {class: 'chat-input'});
            const userInput = createElement('input', {
                type: 'text',
                id: 'userInput',
                placeholder: 'Type your message...'
            });
            const sendButton = createElement('button', {id: 'sendButton'});
            chatHeader.appendChild(chatAvatar);
            chatHeader.appendChild(chatbotName);

            chatInput.appendChild(userInput);
            chatInput.appendChild(sendButton);

            chatbotContainer.appendChild(chatHeader);
            chatbotContainer.appendChild(MessagesContainer);
            chatbotContainer.appendChild(chatInput);

            MessagesContainer.appendChild(chatMessages);
            widgetContainer.appendChild(chatButton);
            widgetContainer.appendChild(chatbotContainer);

            document.body.appendChild(widgetContainer);

            const chatbot = document.getElementById('chatbot');
            const chatBtn = document.getElementById('chatButton');
            const chatMsgs = document.getElementById('chatMessages');
            const userQuery = document.getElementById('userInput');
            const sendBtn = document.getElementById('sendButton');
            const chatMessagesContainer = document.getElementById('chatMessagesContainer');

            let chatbotVisible = false;

            function addChatMessageNoTyping(text, isUser) {
                const messageClass = isUser ? 'user-message' : 'chatbot-message';
                const listItem = document.createElement('li');
                listItem.className = messageClass;
                listItem.innerText = text;
                chatMsgs.appendChild(listItem);


                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }

            function saveConversationToLocalStorage(conversation) {
                localStorage.setItem('chatbotConversation', JSON.stringify(conversation));
            }

            function isConversationHistoryEmpty() {
                const conversation = loadConversationFromLocalStorage();
                return conversation.length;
            }


            function loadConversationFromLocalStorage() {
                const conversation = JSON.parse(localStorage.getItem('chatbotConversation'));
                if (conversation && conversation.length > 0) {
                    return conversation;
                }
                return [];
            }

            function loadMessageHistory() {
                const conversation = loadConversationFromLocalStorage();
                conversation.forEach((message) => {
                    const {role, content} = message;
                    if (role === 'user') {
                        addChatMessage(content, true);
                    } else {
                        addChatMessageNoTyping(content, false);
                    }
                });
            }

            function deleteConversationFromLocalStorage() {
                localStorage.removeItem('chatbotConversation');
            }


            function toggleChatbot() {
                chatbotVisible = !chatbotVisible;
                chatbot.style.display = chatbotVisible ? 'block' : 'none';

                if (chatbotVisible) {
                    chatbot.style.top = '-652px';
                    setTimeout(() => {
                        if (isConversationHistoryEmpty() == 0) {
                            addChatMessageTyping(initialMessage, false);
                        }
                    }, 500);
                    loadMessageHistory();
                } else {
                    chatbot.style.top = '-652px';
                    chatMsgs.innerHTML = '';
                    userQuery.value = '';
                }
            }

            function addChatMessage(text, isUser) {
                const messageClass = isUser ? 'user-message' : 'chatbot-message';
                const listItem = document.createElement('li');
                listItem.className = messageClass;
                listItem.innerText = text;
                chatMsgs.appendChild(listItem);


                chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
            }

            function addChatMessageTyping(text, isUser) {
                const messageClass = isUser ? 'user-message' : 'chatbot-message';
                const listItem = document.createElement('li');
                listItem.className = messageClass;
                chatMsgs.appendChild(listItem);


                function typeText(i) {
                    if (i < text.length) {
                        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                        listItem.innerHTML = text.substring(0, i + 1) + '<span class="typing-dot">.</span>';
                        i++;
                        setTimeout(() => typeText(i), 8);
                    } else {
                        listItem.innerHTML = text;
                        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
                    }
                }

                typeText(0);
            }

            function openChatbot(timestamp) {
                if (!chatbot.startTime) chatbot.startTime = timestamp;
                const progress = Math.min((timestamp - chatbot.startTime) / 300, 1); // 300ms for animation duration
                chatbot.style.top = `${-340 + 340 * progress}px`; // Slide chatbot down
                if (progress < 1) {
                    requestAnimationFrame(openChatbot);
                }
            }

            function handleUserInput() {
                const userMessage = userQuery.value;
                userQuery.value = '';
                if (userMessage.trim() !== '') {
                    addChatMessage(userMessage, true);

                    if (isConversationHistoryEmpty() == 0) {
                        saveConversationToLocalStorage([
                            ...loadConversationFromLocalStorage(),
                            {role: 'chatbot', content: initialMessage}
                        ]);
                    }
                    saveConversationToLocalStorage([
                        ...loadConversationFromLocalStorage(),
                        {role: 'user', content: userMessage}
                    ]);


                    const apiUrl = `${backend_url}/v1/chatbot/chat`;
                    const requestData = {
                        query: userMessage
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'Content-Type': 'application/json',
                            'x-author': backend_token
                        },
                        body: JSON.stringify(requestData)
                    };

                    fetch(apiUrl, requestOptions)
                        .then(response => {
                            if (response.ok) {
                                return response.json();
                            } else {
                                throw new Error('Failed to fetch data from the API');
                            }
                        })
                        .then(data => {

                            var responseText = data.message;
                            addChatMessageTyping(responseText.replace(/\n/g, "<br>"), false);
                            saveConversationToLocalStorage([
                                ...loadConversationFromLocalStorage(),
                                {role: 'chatbot', content: responseText}
                            ]);
                            userQuery.value = '';
                        })
                        .catch(error => {
                            console.error(error);
                        });

                }
            }

            chatBtn.addEventListener('click', toggleChatbot);
            sendBtn.addEventListener('click', handleUserInput);
            userQuery.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    handleUserInput();
                }
            });
        }).catch(error => {
        console.error('Error fetching data:', error);
    });

})();
