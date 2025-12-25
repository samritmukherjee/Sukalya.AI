// Particle Animation System
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = {
    x: undefined,
    y: undefined
};

// Initialize canvas
const initCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

// Handle window resize
window.addEventListener('resize', initCanvas);

// Track mouse movement
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Particle class
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = 'rgba(255, 255, 255, 0.5)';
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        // Attraction to mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
            this.x -= dx / 50;
            this.y -= dy / 50;
        }
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Create particles
const createParticles = () => {
    particles = [];
    const particleCount = canvas.width / 15;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
};

// Connect particles with lines
const connectParticles = () => {
    let opacity = 1;
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                opacity = 1 - (distance / 100);
                ctx.strokeStyle = 'rgba(255, 255, 255,' + opacity + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
};

// Animation loop
const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
};

// Global variables
const BASE_URL = "https://sukalya-ai-backend.onrender.com";
let chatCount = 0;
let currentChatId = null;
let chatHistory = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particle animation
    initCanvas();
    createParticles();
    animate();
    
    // Check if we're on mobile and hide sidebar by default
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('hidden');
    }
});

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('hidden');
}

// Handle Enter key press in input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Handle mic button click
function handleMicClick() {
    addMessage("Voice recognition service is not available right now.", "bot");
}

// Handle authentication button click
function handleAuth() {
    addMessage("Authentication feature is coming soon!", "bot");
}

// Send message function
function sendMessage() {
    const input = document.getElementById("userInput");
    const msg = input.value.trim();
    if (!msg) return;

    // Hide welcome message and show chat container
    const welcomeMessage = document.getElementById("welcomeMessage");
    const chatContainer = document.getElementById("chatContainer");
    const chatBox = document.getElementById("chatBox");
    
    // Always hide welcome message when user sends first message
    if (welcomeMessage && !welcomeMessage.classList.contains('hidden')) {
        welcomeMessage.style.opacity = '0';
        setTimeout(() => {
            welcomeMessage.classList.add('hidden');
            welcomeMessage.style.display = 'none';
        }, 300);
        chatContainer.classList.add('has-messages');
        chatBox.classList.add('active');
    }

    // Add user message
    addMessage(msg, "user");

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    // Send message to Flask backend
    fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: msg
        })
    })
    .then(response => response.json())
    .then(data => {
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Add bot response
        const botReply = data.reply || "Sorry, I could not process your request.";
        addMessage(botReply, "bot");
    })
    .catch(error => {
        console.error('Error:', error);
        // Remove typing indicator
        removeTypingIndicator(typingIndicator);
        
        // Add error message
        addMessage("Sorry, I'm having trouble connecting to the server. Please try again.", "bot");
    });

    input.value = "";
}

// Add message to chat
function addMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    const msgDiv = document.createElement("div");
    msgDiv.className = sender === "user" ? "user-msg" : "bot-msg";
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
    const chatBox = document.getElementById("chatBox");
    const typingDiv = document.createElement("div");
    typingDiv.className = "bot-msg typing-indicator";
    typingDiv.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator(typingIndicator) {
    if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.parentNode.removeChild(typingIndicator);
    }
}

// New chat functionality
function newChat() {
    // Save current chat if it has messages
    const chatBox = document.getElementById("chatBox");
    if (chatBox.children.length > 0) {
        saveCurrentChat();
    }

    // Clear current chat
    clearCurrentChat();
    
    // Hide sidebar on mobile after creating new chat
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.add('hidden');
    }
}

// Save current chat to history
function saveCurrentChat() {
    const chatBox = document.getElementById("chatBox");
    const messages = Array.from(chatBox.children).map(msg => ({
        text: msg.innerText,
        sender: msg.classList.contains('user-msg') ? 'user' : 'bot'
    }));

    if (messages.length > 0) {
        chatCount++;
        const chatId = `chat-${chatCount}`;
        const chatName = `Chat ${chatCount}`;
        
        chatHistory[chatId] = {
            name: chatName,
            messages: messages
        };

        addChatToSidebar(chatId, chatName);
    }
}

// Add chat to sidebar
function addChatToSidebar(chatId, chatName) {
    const chatHistoryDiv = document.getElementById('chatHistory');
    
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.setAttribute('data-chat-id', chatId);
    
    chatItem.innerHTML = `
        <span class="chat-name">${chatName}</span>
        <div class="chat-actions">
            <span class="rename-btn" onclick="event.stopPropagation(); renameChat('${chatId}')" title="Rename chat">✏️</span>
            <span class="delete-btn" onclick="event.stopPropagation(); deleteChat('${chatId}')" title="Delete chat">🗑️</span>
        </div>
    `;
    
    chatItem.addEventListener('click', function(e) {
        if (!e.target.closest('.chat-actions')) {
            loadChat(chatId);
        }
    });
    
    // Insert at the top (most recent first)
    chatHistoryDiv.insertBefore(chatItem, chatHistoryDiv.firstChild);
}

// Load chat from history
function loadChat(chatId) {
    if (chatHistory[chatId]) {
        // Clear current chat
        clearCurrentChat();
        
        // Load messages
        const chat = chatHistory[chatId];
        const chatBox = document.getElementById("chatBox");
        const chatContainer = document.getElementById("chatContainer");
        
        chatContainer.classList.add('has-messages');
        chatBox.classList.add('active');
        
        chat.messages.forEach(msg => {
            addMessage(msg.text, msg.sender);
        });
        
        // Update active chat in sidebar
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-chat-id="${chatId}"]`).classList.add('active');
        
        currentChatId = chatId;
        
        // Hide sidebar on mobile
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.add('hidden');
        }
    }
}

// Clear current chat
function clearCurrentChat() {
    const chatBox = document.getElementById("chatBox");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const chatContainer = document.getElementById("chatContainer");
    
    chatBox.innerHTML = '';
    chatBox.classList.remove('active');
    chatContainer.classList.remove('has-messages');
    
    // Show welcome message with animation
    welcomeMessage.classList.remove('hidden');
    welcomeMessage.style.display = 'block';
    setTimeout(() => {
        welcomeMessage.style.opacity = '1';
    }, 50);
    
    // Remove active class from all chat items
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    
    currentChatId = null;
}

// Rename chat functionality
function renameChat(chatId) {
    const newName = prompt('Enter new chat name:', chatHistory[chatId].name);
    if (newName && newName.trim() !== '') {
        chatHistory[chatId].name = newName.trim();
        const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
        const chatNameSpan = chatItem.querySelector('.chat-name');
        chatNameSpan.textContent = newName.trim();
    }
}

// Delete chat functionality
function deleteChat(chatId) {
    if (confirm('Are you sure you want to delete this chat?')) {
        // Remove from chatHistory object
        delete chatHistory[chatId];
        
        // Remove from DOM
        const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (chatItem) {
            chatItem.remove();
        }
        
        // If this was the currently active chat, clear the current chat
        if (currentChatId === chatId) {
            clearCurrentChat();
        }
    }
}

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    // Reinitialize particle animation on resize
    initCanvas();
    createParticles();
    
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('hidden');
    }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(event.target) && 
        !hamburgerBtn.contains(event.target) &&
        !sidebar.classList.contains('hidden')) {
        sidebar.classList.add('hidden');
    }
});
