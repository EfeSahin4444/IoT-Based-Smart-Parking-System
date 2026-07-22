#include <Wire.h>              
#include <LiquidCrystal_I2C.h> 
#include <Servo.h>             

// --- PIN TANIMLAMALARI ---
#define IR_SLOT_1 A0           
#define IR_SLOT_2 A1           
#define IR_SLOT_3 A2           
#define IR_SLOT_4 A3           

#define IR_ENTRY 2             
#define IR_EXIT 3              

#define SERVO_PIN 9            
#define BUZZER_PIN 8           

LiquidCrystal_I2C lcd(0x27, 16, 2); 
Servo gateServo;                    

int freeSpots = 4;                  
bool slotStatus[4] = {false, false, false, false}; 
bool lastSlotStatus[4] = {false, false, false, false}; 

// Cikis yapacak aracin slot numarasini akilda tutmak icin
int pendingExitSlot = 1; 

// Parazit Engelleme
unsigned long lastDebounceTime[4] = {0, 0, 0, 0}; 
bool lastSensorState[4] = {HIGH, HIGH, HIGH, HIGH}; 
const int debounceDelay = 80; 

void setup() {
  Serial.begin(9600); 
  
  pinMode(IR_SLOT_1, INPUT); pinMode(IR_SLOT_2, INPUT);
  pinMode(IR_SLOT_3, INPUT); pinMode(IR_SLOT_4, INPUT);
  pinMode(IR_ENTRY, INPUT);  pinMode(IR_EXIT, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  lcd.init();      
  lcd.backlight(); 
  lcd.setCursor(0, 0); 
  lcd.print("lvbel c++ Smart"); 
  lcd.setCursor(0, 1); 
  lcd.print("System Ready..."); 
  
  Serial.println("Event,Vehicle_Type,Assigned_Slot,Free_Spots"); 
  delay(1000); 
  lcd.clear(); 
}

void loop() {
  // 1. Sensor Okuma
  bool currentReadings[4]; 
  currentReadings[0] = digitalRead(IR_SLOT_1);
  currentReadings[1] = digitalRead(IR_SLOT_2);
  currentReadings[2] = digitalRead(IR_SLOT_3);
  currentReadings[3] = digitalRead(IR_SLOT_4);

  for (int i = 0; i < 4; i++) {
    if (currentReadings[i] != lastSensorState[i]) {
      lastDebounceTime[i] = millis(); 
    }
    if ((millis() - lastDebounceTime[i]) > debounceDelay) {
      slotStatus[i] = (currentReadings[i] == LOW); 
    }
    lastSensorState[i] = currentReadings[i]; 
  }

  freeSpots = 0;
  for (int i = 0; i < 4; i++) {
    if (!slotStatus[i]) freeSpots++; 
  }

  bool stateChanged = false; 
  for(int i=0; i<4; i++) {
    if(slotStatus[i] != lastSlotStatus[i]) {
      stateChanged = true; 
      
      if (slotStatus[i] == true) { 
        // Arac park yerine Girdi
        logToPC("Entry", "Vehicle", i + 1);
      } else {
        // Arac park yerinden Cikti (Ama otoparktan cikmadi!)
        // Sadece numarasini akilda tutuyoruz, bilgisayara henuz soylemiyoruz
        pendingExitSlot = i + 1;
      }
      
      lastSlotStatus[i] = slotStatus[i]; 
    }
  }

  if (stateChanged) { 
    lcd.setCursor(0, 0);
    lcd.print("P1:"); lcd.print(slotStatus[0] ? "FULL" : "EMPT");
    lcd.print("  P2:"); lcd.print(slotStatus[1] ? "FULL" : "EMPT");
    lcd.setCursor(0, 1);
    lcd.print("P3:"); lcd.print(slotStatus[2] ? "FULL" : "EMPT");
    lcd.print("  P4:"); lcd.print(slotStatus[3] ? "FULL" : "EMPT");
  }

  // 3. Giris Kapisi 
  if (digitalRead(IR_ENTRY) == LOW) { 
    if (freeSpots > 0) { 
      lcd.clear(); 
      lcd.setCursor(0, 0); lcd.print("Vehicle Detected");
      lcd.setCursor(0, 1); lcd.print("Welcome!");
      
      gateServo.attach(SERVO_PIN); 
      delay(100);
      gateServo.write(90); 
      delay(600);
      gateServo.detach(); 
      
      delay(2500); 
      
      gateServo.attach(SERVO_PIN);
      delay(100);
      gateServo.write(0); 
      delay(600);
      gateServo.detach();
      
      delay(500);
      lcd.clear();
      stateChanged = true;
    }
    else { 
      lcd.clear();
      lcd.setCursor(0, 0); lcd.print("PARKING FULL!");
      lcd.setCursor(0, 1); lcd.print("CANNOT ENTER!");
      
      digitalWrite(BUZZER_PIN, HIGH); 
      delay(1000);                    
      digitalWrite(BUZZER_PIN, LOW);  
      lcd.clear();
      stateChanged = true;
    }
  }

  
  if (digitalRead(IR_EXIT) == LOW) { 
    lcd.clear();
    lcd.print("Have a nice day!"); 
    
    gateServo.attach(SERVO_PIN);
    delay(100);
    gateServo.write(90); 
    delay(600);
    gateServo.detach();
    
    // ARAC ANA KAPIDAN CIKIYOR: Cikis sinyalini ve ucreti simdi yansit!
    logToPC("Exit", "Vehicle", pendingExitSlot); 
    
    delay(2500);
    
    gateServo.attach(SERVO_PIN);
    delay(100);
    gateServo.write(0); 
    delay(600);
    gateServo.detach();
    
    delay(500);
    lcd.clear();
    stateChanged = true;
  }
  delay(150); 
}

void logToPC(String event, String vType, int slot) {
  Serial.print(event); Serial.print(",");
  Serial.print(vType); Serial.print(",");
  Serial.println(slot);
}
