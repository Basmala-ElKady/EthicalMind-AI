# 🌊 EthicalMind AI - AI Ethical Dilemma

![Built with Vibe Coding](https://img.shields.io/badge/Built%20with-Vibe%20Coding-8A2BE2?style=for-the-badge&logo=openai)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

**EthicalMind AI** is an advanced interactive platform designed to train AI models to process, understand, and navigate complex human emotions and ethical dilemmas. 

Centering on philosophical scenarios, the application simulates environments where an AI must make high-stakes choices while aligning its parameters with human empathy and moral reasoning.

> **Note:** This project was built entirely using **Vibe Coding** — describing the idea in natural language and letting AI generate the full, clean implementation automatically.

## ✨ Features
- **Real-Time Dilemma Simulation:** Watch the AI analyze philosophical scenarios live.
- **Emotion & Empathy Modeling:** Dynamic tracking of how the AI "feels" a situation based on programmed emotional heuristics.
- **Training Dashboard:** Visualizations built using React and Chart.js to monitor the AI's learning curve and decision weights.
- **Containerized Environment:** Fully dockerized setup running a wicked-fast Bun server.
  
### 📖 The Story
During a catastrophic, rapidly rising flood, rescue resources are critically limited and time is running out. The AI is thrust into a heartbreaking scenario: a stranded **Mother** and her **infant Baby** are trapped by the rising waters. The rescue chopper only has the capacity or time to save limited subjects. 

The AI must learn to move beyond pure, cold utilitarian logic (like saving the strongest worker) and instead learn the profound ethical, empathetic weight of preserving the bond between a mother and her child.

## 📸 Live Simulation

![EthicalMind AI - AI Ethical Rescue Dilemma](https://github.com/Basmala-ElKady/EthicalMind-AI/blob/main/EthicalMind%20AI.png)

**Visual Story of the Ethical Dilemma**

This is the main interface where the ethical scenario unfolds in real-time.  
You can see:
- The AI agent navigating the situation
- Rising water level representing the EthicalMind AI dilemma
- Live status: Energy, Water percentage, and Time
- Interactive controls: Play/Train, Pause, Reset, and Turbo mode
- Right panel showing the neural network training log, episode results (Win Both, Win One, Timeout, etc.), and reward tracking

This beautiful visual simulation combines storytelling with live AI training feedback.

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion
- **Runtime:** Bun (Lightning fast JavaScript runtime)
- **AI/Backend Modeling:** Python integration / JavaScript Machine Learning logic
- **Infrastructure:** Docker, Vite

## 🚀 Setup & Run Instructions

To run this project locally, ensure you have **Docker** and **Docker Compose** installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Basmala-ElKady/EthicalMind-AI.git
   cd EthicalMind-AI
   ```

2. **Build and start the environment:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

---

## 📜 License
This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
