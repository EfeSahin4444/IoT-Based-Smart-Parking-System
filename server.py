# -*- coding: utf-8 -*-
import sys
import subprocess
import csv
import os

try:
    from flask import Flask, jsonify
    from flask_cors import CORS
    import serial
except ModuleNotFoundError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors", "pyserial"])
    from flask import Flask, jsonify
    from flask_cors import CORS
    import serial

import datetime
import threading
import time

app = Flask(__name__)
CORS(app)

valid_slots = ["1", "2", "3", "4"]
slots_data = {
    "1": {"status": "Empty", "entry_time": "---", "exit_time": "---", "duration": 0, "fee": 0},
    "2": {"status": "Empty", "entry_time": "---", "exit_time": "---", "duration": 0, "fee": 0},
    "3": {"status": "Empty", "entry_time": "---", "exit_time": "---", "duration": 0, "fee": 0},
    "4": {"status": "Empty", "entry_time": "---", "exit_time": "---", "duration": 0, "fee": 0}
}

entry_timestamps = {}
csv_file_name = "otopark_kayitlari.csv"


if not os.path.exists(csv_file_name):
    with open(csv_file_name, mode='w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f, delimiter=';') 
        writer.writerow(["Date", "Time", "Event", "Vehicle_Type", "Slot", "Duration_Sec", "Total_Fee_TL"])

def save_to_excel(event, v_type, slot, duration=0, fee=0):
    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")
    
    try:
        with open(csv_file_name, mode='a', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f, delimiter=';') 
            writer.writerow([date_str, time_str, event, v_type, slot, duration, fee])
        print(f"[EXCEL] Data logged: {event} - Slot {slot}")
    except Exception as e:
        print(f"[EXCEL ERROR] Could not write to file: {e}")

def listen_arduino():
    global slots_data, entry_timestamps
    
    arduino_port = "COM3"
    baud_rate = 9600
    
    try:
        ser = serial.Serial(arduino_port, baud_rate, timeout=1)
        print(f"[SYSTEM] Listening to Arduino on {arduino_port}...")
        
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                
                if not line or "Event" in line:
                    continue
                    
                parts = line.split(",")
                if len(parts) >= 3:
                    event = parts[0].strip().title() 
                    v_type = "Vehicle" 
                    slot = parts[2].strip() 
                    
                    if slot not in valid_slots:
                        continue
                    
                    now = datetime.datetime.now()
                    now_str = now.strftime("%H:%M:%S")
                    
                    if event == "Entry":
                        entry_timestamps[slot] = now
                        slots_data[slot] = {
                            "status": "Occupied",
                            "entry_time": now_str,
                            "exit_time": "Inside",
                            "duration": 0,
                            "fee": 0
                        }
                        save_to_excel("Entry", v_type, slot, 0, 0)
                        
                    elif event == "Exit":
                        duration_seconds = 0
                        fee = 0
                        
                        entry_time = entry_timestamps.get(slot)
                        if entry_time:
                            diff = now - entry_time
                            duration_seconds = int(diff.total_seconds())
                            fee = int(duration_seconds // 5)
                            entry_timestamps.pop(slot, None)
                            
                        slots_data[slot] = {
                            "status": "Empty",
                            "entry_time": "---",
                            "exit_time": "---",
                            "duration": 0,
                            "fee": 0
                        }
                        save_to_excel("Exit", v_type, slot, duration_seconds, fee)
                
            time.sleep(0.1)
    except Exception as e:
        print(f"[ERROR] Arduino connection error: {e}")

@app.route('/otopark/slots', methods=['GET'])
def get_slots():
    now = datetime.datetime.now()
    for slot, data in slots_data.items():
        if data["status"] == "Occupied":
            entry_time = entry_timestamps.get(slot)
            if entry_time:
                diff = now - entry_time
                dur = int(diff.total_seconds())
                data["duration"] = dur
                data["fee"] = dur // 5
            
    return jsonify({"slots": slots_data})

if __name__ == '__main__':
    threading.Thread(target=listen_arduino, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)
