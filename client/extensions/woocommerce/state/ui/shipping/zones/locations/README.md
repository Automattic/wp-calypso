# Shipping Zone Methods

This module is used to manage the locations configured inside of a Shipping Zone.

This module only operates inside the shipping zone that's currently being edited, as there's no
way to add/edit/remove locations from a zone outside of the "Edit Zone" screen.

## Reducer

In this part of the state only will be stored the "differences" between what's on the server and what the user has configured.
So, for example, the initial state would look like this:

```js
const object = {
	locations: {
		journal: [], // No actions have been submitted to the journal
		states: null, // "null" means that the locations are *not* filtered by states
		postcode: null, // "null" means that the locations are *not* filtered by postcode
		pristine: true, // "Pristine" indicates that there have been no interaction with the form
	},
};
```

The actions of adding or removing countries or continents to a zone are order-dependent, and can't be computed without
having access to the original server-side locations list. For example, if you select "Africa" and then unselect it, there
is no way to cleanly represent it without knowing which African countries were selected in the first place. Thus,
the reducer will keep a "journal" of all the continent and country-related actions, so the selectors, which have access to
the whole Redux tree, will be able to play those actions back and compute the final list of locations that are selected.

After the user opens the "Edit Locations" modal, a new sub-tree with the same format as the main one will be added, called
"temporaryChanges". When the user closes the dialog, those changes will be merged with the "normal" changes, but if it
"Cancels" the modal they will be discarded instead. So, for example:

```js
const object = {
	locations: {
		journal: [
			{ action: 'ADD_COUNTRY', code: 'US' }, // The user selected "US" before, and then closed the dialog
		],
		states: null,
		postcode: null,
		pristine: false, // There has been interaction with the form
		temporaryChanges: {
			// The user opened the modal again
			journal: [
				{ action: 'REMOVE_COUNTRY', code: 'US' }, // And changed "US" for "UK"
				{ action: 'ADD_COUNTRY', code: 'UK' }, // And changed "US" for "UK"
			],
			states: null,
			postcode: null,
			pristine: false,
		},
	},
};
```

Now, if the user closes the dialog, "UK" will be selected. But if he cancels it, "US" will be selected, because he discarded
the changes he just made inside the dialog.
