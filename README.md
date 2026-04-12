# 🪔 Incredible India — Travel Booking Website

A full-stack travel booking web application for exploring destinations across India, booking packages & hotels, and managing bookings through a premium admin dashboard.

---

## 🌟 Features

### 🧳 User Website (`index.html`)
- **Hero Section** — Full-screen image slider with search bar
- **Destinations** — 8 popular Indian destinations with wishlist support
- **Tour Packages** — Filter by category (Honeymoon, Family, Adventure) and price
- **Hotels** — Filter by price per night
- **Blogs** — Travel stories with category filters and read more/less
- **AI Trip Planner** — Generate day-by-day itinerary based on preferences
- **Weather Widget** — Live or demo weather for popular cities
- **Currency Converter** — INR to USD, EUR, GBP, JPY, AED
- **Travel Insurance** — Info section
- **Testimonials** — User review submission with star rating
- **Google Map** — Destination map embed
- **Wishlist Panel** — Save destinations for later
- **Booking History** — View all past bookings (fetched from MongoDB)
- **Dark Mode** — Toggle dark/light theme
- **Responsive Design** — Works on all screen sizes

### 📄 Destination Detail Page (`detail.html`)
- Full destination info with hero image, highlights, and quick info grid
- Related packages section with booking option
- **Booking Sidebar** — Complete booking form (name, phone, city, address, guests, meal plan)
- Saves booking directly to MongoDB Atlas

### 🛡️ Admin Dashboard (`admin.html`)
- Secure admin-only login
- **Stats Cards** — Total Bookings, Total Revenue, Users, Avg per Booking
- **Monthly Revenue Bar Chart** — Visual bar chart per month
- **Top Booked Items** — Most popular packages/destinations
- **All Bookings Table** — Expandable rows with full customer details
- **Search & Filter** — Search by name, city, phone, item
- **Revenue Analysis Page** — Month-wise collection with totals

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (via Mongoose) |
| **Fonts** | Google Fonts (Playfair Display, DM Sans) |
| **Icons** | Font Awesome 6 |

---

## 📁 Project Structure

```
frontend/
│
├── index.html          # Main website
├── detail.html         # Destination detail & booking page
├── admin.html          # Admin dashboard
├── style.css           # Shared stylesheet
├── script.js           # Frontend JavaScript
├── server.js           # Express backend server
│
├── models/
│   ├── User.js         # Mongoose User schema
│   └── Booking.js      # Mongoose Booking schema
│
├── package.json        # Node.js dependencies
└── README.md           # This file
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or above)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone or download** the project folder.

2. **Navigate to the project directory:**
   ```bash
   cd /home/hello/Downloads/frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the backend server:**
   ```bash
   node server.js
   ```

5. **Open in browser:**
   - 🌐 Website → [http://localhost:3000](http://localhost:3000)
   - 🛡️ Admin → [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 🔐 Demo Credentials

### User Login (on main website)
| Field | Value |
|---|---|
| Username | `user123` |
| Password | `user1234` |

### Admin Login (`/admin.html`)
| Field | Value |
|---|---|
| Username | `admin123` |
| Password | `admin1234` |

> These accounts are **automatically created** in the database when the server starts for the first time.

---

## 🗄️ Database (MongoDB Atlas)

The project uses **MongoDB Atlas** as the cloud database.

**Connection String:**
```
mongodb+srv://ahsan786:Ahsan@786@cluster0.7affurj.mongodb.net/incredibleindia
```

> ⚠️ Make sure your IP address is whitelisted in MongoDB Atlas under **Network Access → Allow Access From Anywhere (0.0.0.0/0)**.

### Collections
| Collection | Description |
|---|---|
| `users` | Stores user accounts with roles (`user` / `admin`) |
| `bookings` | Stores all booking records with customer details |

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/login` | User/Admin login | None |
| `POST` | `/api/bookings` | Create a new booking | User ID required |
| `GET` | `/api/bookings?userId=` | Get bookings for a user | User ID required |
| `GET` | `/api/admin/bookings?adminId=` | Get all bookings | Admin only |
| `GET` | `/api/admin/stats?adminId=` | Get stats & monthly revenue | Admin only |

---

## 📋 Booking Form Fields

When a user clicks **Book Now**, they must fill:
- ✅ Full Name
- ✅ Mobile Number (exactly 10 digits)
- ✅ City
- ✅ Full Address (minimum 10 characters)
- ✅ Number of Guests
- ✅ Meal Plan (With Meals / Without Meals)

---

## 📸 Pages Overview

| Page | URL | Description |
|---|---|---|
| Home | `/` | Main landing page |
| Destination Detail | `/detail.html?id=1` | Full info + booking for destination |
| Admin Dashboard | `/admin.html` | Admin-only management panel |

---

## 👨‍💻 Developer Notes

- The backend serves all static frontend files directly via Express.
- User sessions are stored in `localStorage` (frontend) and `sessionStorage` (admin).
- Dark mode preference is persisted in `localStorage`.
- The admin user's role is verified server-side on every admin API call.

---

## 📞 Contact Info (Website)

- 📍 12, Travel Tower, Connaught Place, New Delhi – 110001
- 📞 +91 85980 61841
- 📧 info@incredibleindia.travel
- 🕐 Mon–Sat: 9 AM – 6 PM

---

## 📄 License

This project is for **demo/educational purposes** only.

© 2024 Incredible India. All rights reserved.
