# SmartBiz AI

## AI-Powered Business Analytics & Data Management

SmartBiz AI is an AI-powered business analytics and data management system that allows users to interact with business data through a natural-language Telegram assistant.

Instead of manually searching and updating spreadsheets, users can ask questions about their business data or request updates through Telegram. The system processes these requests using AI and connects them to Google Sheets, while the analytics dashboard provides a visual view of the business information.

🚀 Live Demo

Live Application: https://flux-view-dashboard.lovable.app

## Problem

Businesses often maintain client and payment information in spreadsheets. Finding information, calculating revenue, comparing clients, and updating records manually can be repetitive and time-consuming.

## Solution

SmartBiz AI provides a conversational interface for business data management.

Users can:

* Ask questions about client and payment data
* Check total revenue
* Identify the highest-paying clients
* Analyze client-wise and industry-wise data
* Update client records using natural-language commands
* View business information through an interactive analytics dashboard

## System Architecture

```text
Telegram
   ↓
n8n Workflow
   ↓
Gemini AI Agent
   ↓
Google Sheets
   ↓
Analytics Dashboard
```

## Core Components

* **Telegram** — conversational user interface
* **Gemini AI** — understands natural-language requests
* **n8n** — workflow automation and integration
* **Google Sheets** — central business data source
* **Lovable** — interactive analytics dashboard

## Data

The prototype uses business records containing:

* Client
* Amount Paid
* Email
* Industry

The demonstration uses synthetic data.

## How It Works

1. A user sends a natural-language request through Telegram.
2. The AI agent interprets the user's intent.
3. n8n processes the appropriate workflow.
4. Google Sheets is queried or updated.
5. The result is returned to the user.
6. The dashboard visualizes the business data and analytics.

## Key Value

SmartBiz AI turns a traditional spreadsheet-based workflow into a conversational AI-powered system, reducing repetitive data operations and making business information easier to access and understand.

## Demo

The project demonstrates the complete flow:

**User → Telegram → AI → Google Sheets → Analytics Dashboard**

## Project Status

Working prototype developed for the Razorpay Buildathon Open Track.

<img width="1896" height="856" alt="image" src="https://github.com/user-attachments/assets/bc0b5106-607c-44de-90c4-821b9fc42eb8" />

