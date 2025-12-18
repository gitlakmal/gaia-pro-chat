# 🤖 Gaia Pro Chat
> **Intelligent Local AI Interface** optimized for Gaia & Qwen 2.5 Models.

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Fast-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🌟 Overview

**Gaia Pro Chat** is a robust, production-ready frontend application designed to interact seamlessly with locally running Large Language Models (LLMs). Unlike standard chat interfaces, this project focuses on **privacy, document processing, and efficient data management** without relying on external cloud services.

It serves as a powerful UI for the **Gaia Node** running locally.

---

## ⚙️ Backend & Configuration (Crucial)

⚠️ **This is a Frontend-only application.** You must have the Gaia backend running for it to work.

### 1. Gaia Version & Model
* **Backend:** Ensure your **Gaia Node** is installed and running.
* **Model:** This app is pre-configured for `Qwen2.5-0.5B-Instruct-CPU`.
    * *Note:* If you use a different model, you must update the `model` name in `src/App.tsx` (Line ~165).

### 2. Port Configuration (8000 vs 8080)
* **Default Setting:** The code expects the API to be at:
    `http://localhost:8000/api/v0/chat/completions`
* **⚠️ Important Warning:** Gaia often defaults to Port **8080**.
    * If your Gaia node is running on Port **8080**, you must either:
        1.  Start Gaia on Port 8000 (`gaia run --port 8000 ...`).
        2.  **OR** Update the `src/App.tsx` file to point to `http://localhost:8080...`.

---

## 🚀 Key Capabilities

| Feature | Description |
| :--- | :--- |
| 📄 **Advanced File Processing** | Seamlessly upload and analyze **PDF documents** (via `pdfjs-dist`) and code files (`.js`, `.py`, `.ts`, etc.) directly within the chat context. |
| 💾 **Smart Session Manager** | Built-in local storage system that maintains chat history. Enforces a **50-session limit** with auto-cleanup to optimize browser performance. |
| 📥 **Data Portability** | Export and download individual chat sessions as **.txt files** for offline reference and record-keeping. |
| ⚡ **Modern Tech Stack** | Built with **React + TypeScript** and **Vite** for lightning-fast performance, featuring a responsive **Dark Mode UI**. |

---

## 🛠️ Tech Stack

* **Frontend:** React (TypeScript)
* **Build Tool:** Vite
* **Icons:** Lucide React
* **PDF Processing:** PDF.js (`pdfjs-dist`)
* **Styling:** CSS3 (Dark Theme)

---

## 📦 Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/gitlakmal/gaia-pro-chat.git](https://github.com/gitlakmal/gaia-pro-chat.git)
cd gaia-pro-chat
