Application Passwords Data
======

This component is a wrapper module for interacting with the wpcom.js `/me` endpoint to retrieve, create, and delete  application passwords for the current user.

```es6
import AppPasswords from 'lib/application-passwords-data';
```

### `ApplicationPasswords#get()`
The get request will defer to `ApplicationPasswords#data` to check for local caches, otherwise calling the fetch method.

### `ApplicationPasswords#fetch()`
Fetch with call the wpcom.js `/me` endpoint to get current application passwords data for the current user. It stores the results in localstorage with `store` and triggers a `change` event on the object.

### `ApplicationPasswords#revoke()`
Given an application password ID, revoke will call the wpcom.js `/me` endpoint to remove an application password. Upon success, it will also update the application passwords stored in localstorage as well as `ApplicationPasswords#data`.

### `ApplicationPasswords#create()`
Create will call the wpcom.js `/me` endpoint to create a new application password. Upon success, it will store the result in `ApplicationPasswords#newApplicationPassword` as well as call `ApplicationPasswords#fetch()` to refresh the data.

### `ApplicationPasswords#hasNewPassword()`
Returns a boolean that describes whether `ApplicationPasswords#newApplicationPassword` is not empty.

### `ApplicationPasswords#clearNewPassword()`
Clears `ApplicationPasswords#newApplicationPassword` by setting it to null and emits a `change` event.
