# Shipping Zones

This module is used to manage Shipping Zones settings. This includes adding, removing and editing shipping zones. Since
shipping zones have a lot of information, parts of them will be handled by other modules inside this one, such as
the shipping methods a Zone has configured, or the locations corresponding to a Zone.

## Reducer

In this part of the state only will be stored the "differences" between what's on the server and what the user has configured.
So, for example, the initial state would look like this:

```js
const object = {
	zones: {
		creates: [], // No new zones have been created
		updates: [], // No settings for any given zone have been changed
		deletes: [], // No zones have been deleted
		currentlyEditingId: null, // The "Edit Zone" modal isn't open
	},
};
```

After the user has made some changes, the state could look like this:

```js
const object = {
	zones: {
		creates: [
			{
				// 1 new zone has been created:
				id: { index: 0 }, // Temporary ID, since this zone still doesn't have a real ID provided by the API
				name: 'My New Awesome Zone',
				methods: {
					// This section will be detailed in the zones/methods module
					creates: [],
					updates: [],
					deletes: [],
				},
			},
		],
		updates: [
			// The settings for 2 zones have changed:
			{
				id: 1, // Zone ID, as provided by the API
				name: 'New Name For Zone 1',
				methods: {
					// This section will be detailed in the zones/methods module
					creates: [],
					updates: [],
					deletes: [],
				},
			},
			{
				id: 2, // Zone ID, as provided by the API
				// Note that the user hasn't changed the zone name here. The name returned by the API is still valid then.
				methods: {
					// This section will be detailed in the zones/methods module
					creates: [],
					updates: [],
					deletes: [ { id: 42 } ],
				},
			},
		],
		deletes: [
			{ id: 3 }, // The user deleted the zone with ID: 3, but none of this has been commited to the server yet
		],
		currentlyEditingId: 4, // The "Edit Zone" modal is open, the user is editing Zone ID: 4
		currentlyEditingChanges: {
			name: 'Heyyyyyy!', // This is the new name for Zone ID: 4, but it's silly. If the user "Cancels" the modal, it will be discarded.
			methods: {
				// This section will be detailed in the zones/methods module
				creates: [],
				updates: [],
				deletes: [],
			},
		},
	},
};
```

An important distinction between this reducer and less complicated ones, is that it has an "intermediate state".
That means that the user can open a modal to edit/create a Zone, and all the changes he does there can be canceled
if he cancels the modal. All those changes need to be in a different part of the state, so they can be either
committed when the user closes the modal, or discarded when the user cancels it.
