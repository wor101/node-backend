***AJAX Updates***
1. Delete contacts
  - 'DELETE' Method to http://localhost:3000/api/contacts/:id
  - Success: 204 No Content
  - Failure: 400 

2. Get all contacts
  - 'GET' http://localhost:3000/api/contacts
  - Success: 200 [{JSON with all contacts}]
  - failure: ??

3. Get single contact
  - 'GET' http://localhost:3000/api/contacts/:id
  - Success: 200 {JSON with single contact}
  - Failure: 400

4. Save a contact
  - 'POST' http://localhost:3000/api/contacts/
  - accepts JSON or query string as request body
  - Success: 200 or 201 ??? {JSON of contact}
  - Failure: 400

5. Update Contact
  - 'PUT' http://localhost:3000/api/contacts/:id
  - accepts JSON or query string as request body
  - keeps previous values of attributes that already exist and are not present
  - Success: 200 or 201 ??? {JSON of contact}
  - Failure: 400


***Data**
All Contacts:
HTTP/1.1 200 OK

[
  {
    "id": 1,
    "full_name": "Arthur Dent",
    "email": "dent@example.com",
    "phone_number": "12345678901",
    "tags": "work,business"
  },
  {
    "id": 2,
    "full_name": "George Smiley",
    "email": "smiley@example.com",
    "phone_number": "12345678901",
    "tags": null
  }
]

Single Contact:
HTTP/1.1 200 OK
{
  "id": 1,
  "full_name": "Arthur Dent",
  "email": "dent@example.com",
  "phone_number": "12345678901",
  "tags": "work,business"
}