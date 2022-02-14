# wheel-of-fortune-backend

# API:
## Register

* **URL**
  
  /auth/register

* **Method:**
  
  `POST`
  
*  **URL Params**
   
   None

* **Data Params**

  **Required:**

   `name=[string]`

   `login=[string]`

   `password=[string]`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:**
    ```json
    {
        "login": "user123", 
        "name": "User", 
        "rolled": -1, 
        "_id": "6207faa26f3a944865729df1",
        "__v": 0
    }
    ```
 
* **Error Response:**

  * **Code:** 400 BAD REQUEST <br />
    **Content:**
    ```json
    { 
        "message": "login must be a string", 
        "status": 400
    }
    ```

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:**
    ```json
    { 
        "message": "User with login user123 already exists", 
        "status": 400
    }
    ```

## Login

* **URL**
  
  /auth/login

* **Method:**
  
  `POST`
  
*  **URL Params**
   
   None

* **Data Params**

  **Required:**

   `login=[string]`

   `password=[string]`

* **Success Response:**

  * **Code:** 200 <br />
    **Content:**
    ```json
    {
        "login": "user123", 
        "name": "User", 
        "rolled": -1, 
        "_id": "6207faa26f3a944865729df1",
        "__v": 0
    }
    ```
 
* **Error Response:**

  * **Code:** 400 BAD REQUEST <br />
    **Content:**
    ```json
    { 
        "message": "login must be a string", 
        "status": 400
    }
    ```

  OR

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:**
    ```json
    {
        "message": "Wrong credentials provided", 
        "status": 401
    }
    ```

## Logout

* **URL**
  
  /auth/logout

* **Method:**
  
  `GET`
  
*  **URL Params**
   
   None

* **Data Params**

   None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:**
    ```OK```
 
* **Error Response:**

   None

## Roll

* **URL**
  
  /roll

* **Method:**
  
  `GET`
  
*  **URL Params**
   
   None

* **Data Params**

   None

* **Success Response:**

  * **Code:** 200 <br />
    **Content:**
    ```json
    {
        "rolled": 6
    }
    ```
 
* **Error Response:**

  * **Code:** 400 BAD REQUEST <br />
    **Content:**
    ```json
    {
        "message": "Already rolled", 
        "status": 400
    }
    ```

  OR

  * **Code:** 401 UNAUTHORIZED <br />
    **Content:**
    ```json
    {
        "message": "Authentication token missing", 
        "status": 401
    }
    ```