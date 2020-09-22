# UI

This module is used to manage ui data

## Reducer structure

```js
const object = {
	[ siteId ]: {
		payments: {
			methods: [],
		},
		products: {},
		shipping: {},
	},
};
```

- [payments](payments/README.md)

## helpers.js

When updating, creating, and deleting we need to track those changes locally as
the api does not always return clean and updated data on save. By tracking those
changes locally we can overlay those edits, creates, and deletes over the
existing data from the api. This uses something called buckets. For each
operation there is a bucket: create, delete, and update. When a change is made
those changes get placed in each bucket.
