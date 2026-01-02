


+----------------+          +-----------------+          +------------------+
|                |          |                 |          |                  |
|     Users      +--------->+   Backend APIs  +--------->+    MongoDB       |
|                |          | (Node.js + JWT) |          | (Users, Slots,   |
|  React Frontend|<---------+                 |<---------+ Appointments)    |
+----------------+          +-----------------+          +------------------+

User Flow:
1. User selects provider → Backend returns available slots
2. User books a slot → Backend validates availability → Slot marked BOOKED
3. User cancels/reschedules → Slot updated and availability released


Database Schemas and their end points 
+----------------+
|      Users     |
+----------------+
| _id: ObjectId  |
| name: string   |
| email: string  |
| password: string|
| role: USER | PROVIDER | ADMIN |
| isActive: bool |
| isDeleted: bool|
| specialization: string |
| experienceYears: number|
| consultationFee: number|
| permissions: []|
+----------------+



GET    /api/providers            → List all providers
GET    /api/providers/:id        → Get provider by ID
GET    /api/providers/withslots  → Get providers with available slots
POST   /api/providers            → Create provider (ADMIN)
PUT    /api/providers/:id        → Update provider (ADMIN)
DELETE /api/providers/:id        → Soft delete provider (ADMIN)




+----------------+
|      Slots     |
+----------------+
| _id: ObjectId  |
| providerId: ObjectId → Users |
| startTime: Date|
| endTime: Date  |
| status: AVAILABLE | BOOKED | BLOCKED |
| appointmentId: ObjectId → Appointments |
+----------------+

GET    /api/slots/provider/:providerId  → Get available slots for provider
GET    /api/slots/my                    → Provider’s own slots
POST   /api/slots                        → Create slots (Provider)
PUT    /api/slots/:id                     → Update slot (Provider)
DELETE /api/slots/:id                     → Delete slot (Provider)
PUT    /api/slots/:id/toggle             → Block/Unblock slot
GET    /api/slots/all                     → Admin: Get all slots


+----------------+
|  Appointments  |
+----------------+
| _id: ObjectId  |
| userId: ObjectId → Users |
| providerId: ObjectId → Users |
| slotId: ObjectId → Slots |
| status: BOOKED | CANCELLED | RESCHEDULED |
| createdAt: Date |
| updatedAt: Date |
+----------------+


GET    /api/appointments/history           → Fetch user’s appointment history
POST   /api/appointments                   → Book appointment
PUT    /api/appointments/:id/reschedule   → Reschedule appointment
DELETE /api/appointments/:id               → Cancel appointment



Data Flow 

User selects provider
   ↓  GET /api/providers/withslots
Backend returns providers with available slots
   ↓
User selects a slot
   ↓  POST /api/appointments { slotId }
Backend validates slot
   ↓
Slot.status = BOOKED
Appointment created
   ↓
User cancels/reschedules
   ↓  DELETE /api/appointments/:id
   ↓  or PUT /api/appointments/:id/reschedule { newSlotId }
Backend updates slot status to AVAILABLE / BOOKED accordingly


