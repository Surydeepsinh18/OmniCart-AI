# 🛒 OmniCart AI

> An AI-powered smart shopping platform with product comparison, live AI chat, and an intelligent dashboard.

---

## ✨ Features

- **🤖 AI-Powered Dashboard** — Smart analytics and insights at your fingertips
- **🔍 Product Comparison** — Compare products side-by-side with AI recommendations
- **🛒 Smart Cart** — Intelligent shopping cart with real-time updates
- **💬 Live AI Chat** — Get instant help and product suggestions via AI
- **📊 Analytics Dashboard** — Track your shopping patterns and trends
- **❓ FAQ System** — AI-curated frequently asked questions
- **🔐 User Authentication** — Secure login and signup system
- **📱 Responsive Design** — Works seamlessly on all devices

---

## 🚀 Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | HTML, CSS, JavaScript   |
| Backend    | Node.js, Express.js     |
| Database   | MongoDB (Mongoose)      |
| Build Tool | Vite                    |
| AI         | Live AI Integration     |

---

## 📦 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/omnicart-ai.git
   cd omnicart-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/omnicart
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Start the frontend dev server** (for development)
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```
omnicart-ai/
├── index.html          # Landing page
├── dashboard.html      # AI Dashboard
├── cart.html            # Shopping Cart
├── compare.html         # Product Comparison
├── learn-more.html      # Learn More page
├── server.js            # Express backend server
├── app.js               # App configuration
├── liveApi.js           # Live AI API integration
├── styles.css           # Main styles
├── dashboard.css        # Dashboard styles
├── cart.css              # Cart styles
├── compare.css           # Comparison styles
├── dashboard.js         # Dashboard logic
├── cart.js              # Cart logic
├── compare.js           # Comparison logic
├── js/
│   ├── searchHistory.js # Search history tracking
│   └── wishlist.js      # Wishlist functionality
├── models/
│   ├── Cart.js          # Cart data model
│   ├── Faq.js           # FAQ data model
│   └── User.js          # User data model
├── package.json
└── .gitignore
```

---

## 🛠️ Available Scripts

| Command           | Description                     |
|--------------------|---------------------------------|
| `npm start`       | Start the production server     |
| `npm run server`  | Start the backend server        |
| `npm run dev`     | Start Vite dev server           |
| `npm run build`   | Build for production            |
| `npm run preview` | Preview production build        |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Surydeepsinh Rajput**

---

> Built with ❤️ using AI-powered technology
