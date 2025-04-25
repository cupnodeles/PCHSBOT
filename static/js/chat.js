

document.addEventListener('DOMContentLoaded', function () {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatBox = document.getElementById('chat-box');
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatContainer = document.getElementById('chat-container');
    const startChatBtn = document.getElementById('start-chat');
    const quickQuestions = document.getElementById('quick-questions');
    const quickQuestionBtns = document.querySelectorAll('.quick-question');

    const sessionId = Date.now().toString();

    // Show welcome screen initially
    welcomeScreen.style.display = 'flex';
    chatContainer.style.display = 'none';

    // Start chat button click handler
    startChatBtn.addEventListener('click', function() {
        // Add pulse animation class
        this.classList.add('pulse');

        // Fade out welcome screen
        welcomeScreen.style.animation = 'fadeIn 0.5s ease-out reverse forwards';

        // After fade out completes, show chat container
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            chatContainer.style.display = 'block';

            // Add bot introduction with slight delay
            setTimeout(() => {
                addMessage('bot', 'Hello! I\'m PCHSBOT, your virtual assistant for the Philippine College of Health Sciences. How can I help you today?');
            }, 300);
        }, 500);
    });

    // Quick question button click handlers
    quickQuestionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.textContent;
            messageInput.value = question;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    chatForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const message = messageInput.value.trim();

        if (!message) return;

        addMessage('user', message);
        messageInput.value = '';

        // Hide quick questions after first user message
        quickQuestions.style.display = 'none';

        // Typing animation
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot typing';
        typingIndicator.innerHTML = `
            <div class="typing">
                <span></span><span></span><span></span>
            </div>
        `;
        chatBox.appendChild(typingIndicator);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `message=${encodeURIComponent(message)}&session_id=${sessionId}`
            });

            const data = await response.json();
            chatBox.removeChild(typingIndicator);

            if (data.response) {
                const formattedText = formatClickableLinks(data.response);
                addMessage('bot', formattedText, true);
            } else {
                throw new Error('No response from server');
            }
        } catch (error) {
            console.error('Error:', error);
            chatBox.removeChild(typingIndicator);
            addMessage('bot', 'Sorry, an error occurred. Please try again.');
        }
    });

    function addMessage(sender, text, isHTML = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    // Avatar element stays
    const avatar = document.createElement('img');
    avatar.className = 'message-avatar';
    avatar.src = sender === 'bot'
        ? '/static/images/pchs-bg.png'
        : '/static/images/user-icon.png';
    avatar.alt = `${sender} avatar`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (isHTML) {
        contentDiv.innerHTML = text;
    } else {
        contentDiv.textContent = text;
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

    function formatClickableLinks(text) {
        if (!text) return '';

        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>\n$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<strong>\n$1</strong>');
        // Convert plain URLs into clickable links
        return text.replace(/(https?:\/\/[^\s)]+)/g, (url) => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        });
    }
});