/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { mergeMethodEdits } from '../helpers';

describe( 'mergeMethodEdits', () => {
	test( 'should return the current edits when there are no saved edits', () => {
		const zoneMethodEdits = {
			creates: [],
			updates: [],
			deletes: [],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};
		const currentMethodEdits = {
			creates: [ { id: { index: 0 } } ],
			updates: [ { id: 1, title: 'Wololo' } ],
			deletes: [ { id: 2 } ],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};

		expect( mergeMethodEdits( zoneMethodEdits, currentMethodEdits ) ).to.deep.equal(
			currentMethodEdits
		);
	} );

	test( 'should return the saved edits when there are no current edits', () => {
		const zoneMethodEdits = {
			creates: [ { id: { index: 0 } } ],
			updates: [ { id: 1, title: 'Wololo' } ],
			deletes: [ { id: 2 } ],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};
		const currentMethodEdits = {
			creates: [],
			updates: [],
			deletes: [],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};

		expect( mergeMethodEdits( zoneMethodEdits, currentMethodEdits ) ).to.deep.equal(
			zoneMethodEdits
		);
	} );

	test( 'should return the union of all the edits', () => {
		const zoneMethodEdits = {
			creates: [ { id: { index: 0 } } ],
			updates: [ { id: 1, title: 'Wololo' } ],
			deletes: [ { id: 2 } ],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};
		const currentMethodEdits = {
			creates: [ { id: { index: 1 } } ],
			updates: [ { id: 3, title: 'Wololo' } ],
			deletes: [ { id: 4 } ],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};

		expect( mergeMethodEdits( zoneMethodEdits, currentMethodEdits ) ).to.deep.equal( {
			creates: [ { id: { index: 0 } }, { id: { index: 1 } } ],
			updates: [
				{ id: 1, title: 'Wololo' },
				{ id: 3, title: 'Wololo' },
			],
			deletes: [ { id: 2 }, { id: 4 } ],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		} );
	} );

	test( 'should merge edits for the same shipping zone method', () => {
		const zoneMethodEdits = {
			creates: [ { id: { index: 0 }, key: 'value', title: 'Wololo' } ],
			updates: [ { id: 1, key: 'value', title: 'Wololo' } ],
			deletes: [],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};
		const currentMethodEdits = {
			creates: [ { id: { index: 0 }, title: 'NewCreateTitle' } ],
			updates: [ { id: 1, title: 'NewUpdateTitle' } ],
			deletes: [],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};

		expect( mergeMethodEdits( zoneMethodEdits, currentMethodEdits ) ).to.deep.equal( {
			creates: [ { id: { index: 0 }, key: 'value', title: 'NewCreateTitle' } ],
			updates: [ { id: 1, key: 'value', title: 'NewUpdateTitle' } ],
			deletes: [],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		} );
	} );

	test( 'should remove previous updates or creates for a method that has been deleted', () => {
		const zoneMethodEdits = {
			creates: [ { id: { index: 0 }, title: 'Wololo' } ],
			updates: [ { id: 1, title: 'Wololo' } ],
			deletes: [],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};
		const currentMethodEdits = {
			creates: [],
			updates: [],
			deletes: [ { id: { index: 0 } }, { id: 1 } ],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};

		expect( mergeMethodEdits( zoneMethodEdits, currentMethodEdits ) ).to.deep.equal( {
			creates: [],
			updates: [],
			deletes: [ { id: 1 } ],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		} );
	} );

	test( 'should preserve the open method id', () => {
		const zoneMethodEdits = {
			creates: [],
			updates: [],
			deletes: [],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};
		const currentMethodEdits = {
			creates: [ { id: { index: 0 } } ],
			updates: [ { id: 1, title: 'Wololo' } ],
			deletes: [ { id: 2 } ],
			currentlyEditingId: 7,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};

		expect( mergeMethodEdits( zoneMethodEdits, currentMethodEdits ) ).to.deep.equal(
			currentMethodEdits
		);
	} );

	test( 'should preserve the isNew state', () => {
		const zoneMethodEdits = {
			creates: [],
			updates: [],
			deletes: [],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};
		const currentMethodEdits = {
			creates: [ { id: { index: 0 } } ],
			updates: [ { id: 1, title: 'Wololo' } ],
			deletes: [ { id: 2 } ],
			currentlyEditingId: { index: 1 },
			currentlyEditingNew: true,
			currentlyEditingChangedType: false,
		};

		expect( mergeMethodEdits( zoneMethodEdits, currentMethodEdits ) ).to.deep.equal(
			currentMethodEdits
		);
	} );

	test( 'should preserve the changed type state', () => {
		const zoneMethodEdits = {
			creates: [],
			updates: [],
			deletes: [],
			currentlyEditingId: null,
			currentlyEditingNew: false,
			currentlyEditingChangedType: false,
		};
		const currentMethodEdits = {
			creates: [ { id: { index: 0 } } ],
			updates: [ { id: 1, title: 'Wololo' } ],
			deletes: [ { id: 2 } ],
			currentlyEditingId: { index: 0 },
			currentlyEditingNew: false,
			currentlyEditingChangedType: true,
		};

		expect( mergeMethodEdits( zoneMethodEdits, currentMethodEdits ) ).to.deep.equal(
			currentMethodEdits
		);
	} );
} );
