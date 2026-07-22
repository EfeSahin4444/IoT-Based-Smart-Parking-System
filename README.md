# 🚗 IoT-Based Smart Parking System

An end-to-end, multi-layered Smart Parking Management System that integrates embedded hardware sensors, a Python Flask REST API backend, and a React Native cross-platform mobile application for real-time occupancy and billing tracking.

---

## 📌 Architectural Overview

The system operates across three distinct layers connected via Serial and HTTP communication protocols:

1. **Hardware Layer (Arduino C++)**: 
   - Uses active-low Infrared (IR) sensors to detect vehicle presence.
   - Handles physical input debouncing using non-blocking `millis()` timing logic.
   - Displays parking availability on a 16x2 I2C LCD screen and controls an entry barrier via a SG90 Servo motor.
   - Emits real-time event logs (`Entry`, `Exit`) over Serial UART (`9600 Baud`).

2. **Backend & Data Pipeline (Python / Flask)**:
   - Uses a background thread (`pyserial`) to continuously listen to Serial port events without blocking HTTP operations.
   - Computes real-time parking duration (using epoch timestamp deltas) and dynamic fees.
   - Exposes RESTful API endpoints (`/otopark/slots`) for client-side state synchronization.
   - Persists transactional logs into a structured CSV file (`otopark_kayitlari.csv`) using `utf-8-sig` encoding and custom delimiters.

3. **Mobile Client (React Native / Expo)**:
   - Built with React Hooks (`useState`, `useEffect`) and asynchronous network handling (`fetch`).
   - Features **Real-Time Dynamic Polling** (1-second interval) to render live duration and fee updates for active vehicles.
   - Utilizes `SafeAreaProvider` for edge-to-edge UI compatibility across iOS and Android devices.

---

## 🛠️ Tech Stack & Hardware Components

### Hardware Components
* **Microcontroller**: Arduino Uno (ATmega328P)
* **Occupancy Sensors**: 4x Active-Low Infrared (IR) Obstacle Detection Modules
* **Display**: 16x2 Character LCD (with I2C Backpack module)
* **Actuator**: SG90 Micro Servo Motor (Entry Barrier Control)
* **Prototyping**: Breadboard, External Jumper Wires, 5V Power Supply

### Software Stack
* **Firmware**: C++ (Arduino IDE)
* **Backend**: Python 3.x, Flask, Flask-CORS, PySerial, Threading
* **Mobile App**: JavaScript (ES6+), React Native, Expo Go, `react-native-safe-area-context`
* **Data Storage**: CSV (Excel compatible)

---

## 📡 API Reference

### Get All Parking Slots
Retrieves the real-time status, entry times, calculated duration, and dynamic fee of all 4 slots.

* **URL**: `/otopark/slots`
* **Method**: `GET`
* **Response Sample**:

```json
{
  "slots": {
    "1": {
      "status": "Occupied",
      "entry_time": "14:22:05",
      "exit_time": "Inside",
      "duration": 45,
      "fee": 9
    },
    "2": {
      "status": "Empty",
      "entry_time": "---",
      "exit_time": "---",
      "duration": 0,
      "fee": 0
    }
  }
}
