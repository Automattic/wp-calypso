# Shipping Zone Methods

This module is used to manage the Shipping Methods configured inside of a Shipping Zone.

This module only operates inside the shipping zone that's currently being edited, as there's no
way to add/edit/remove shipping methods from a zone outside of the "Edit Zone" modal.

## Reducer

In this part of the state only will be stored the "differences" between what's on the server and what the user has configured.
So, for example, the initial state would look like this:

```js
const object = {
	methods: {
		creates: [], // No new methods have been added
		updates: [], // No settings for any existing method have been changed
		deletes: [], // No methods have been removed
	},
};
```

After the user has made some changes, the state could look like this:

```js
const object = {
	zones: {
		creates: [
			{
				// 1 new method has been added by the user:
				id: { index: 0 }, // Temporary ID, since this method still doesn't have a real ID provided by the API
				title: 'Ultra free shipping Plus 2000',
				methodType: 'free_shipping',
				min_amount: 10.0,
			},
			{
				// 1 new method has been added as a result of the user changing a method's type:
				id: { index: 1 }, // Temporary ID, since this method still doesn't have a real ID provided by the API
				_originalId: 4, // This is only using for sorting the methods, so when the user changes a method's type the UI doesn't jump around
				methodType: 'flat_rate',
				cost: 10.0,
			},
		],
		updates: [
			// The settings for 1 method have changed:
			{
				id: 1, // Shipping Method ID, as provided by the API
				cost: 10.0,
			},
		],
		deletes: [
			{ id: 2 }, // The user deleted the method with ID: 2, but none of this has been commited to the server yet
			{ id: 4 }, // The user didn't explicitly delete this method, but it was deleted when changing its type
		],
	},
};
```
