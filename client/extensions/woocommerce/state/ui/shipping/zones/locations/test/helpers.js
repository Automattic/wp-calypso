/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { mergeLocationEdits } from '../helpers';
import { JOURNAL_ACTIONS } from '../reducer';

describe( 'mergeLocationEdits', () => {
	test( 'should return the current edits when there are no saved edits', () => {
		const zoneLocationEdits = {
			journal: [],
			states: null,
			postcode: null,
			pristine: true,
		};
		const currentLocationEdits = {
			journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' } ],
			states: {
				add: [ 'NY' ],
				remove: [],
				removeAll: true,
			},
			postcode: null,
			pristine: false,
		};

		expect( mergeLocationEdits( zoneLocationEdits, currentLocationEdits ) ).to.deep.equal(
			currentLocationEdits
		);
	} );

	test( 'should return the saved edits when there are no current edits', () => {
		const zoneLocationEdits = {
			journal: [],
			states: null,
			postcode: '12345',
			pristine: false,
		};
		const currentLocationEdits = null;

		expect( mergeLocationEdits( zoneLocationEdits, currentLocationEdits ) ).to.deep.equal(
			zoneLocationEdits
		);
	} );

	test( 'should return the saved edits when there current edits are empty (pristine)', () => {
		const zoneLocationEdits = {
			journal: [],
			states: null,
			postcode: '12345',
			pristine: false,
		};
		const currentLocationEdits = {
			journal: [],
			states: null,
			postcode: null,
			pristine: true,
		};

		expect( mergeLocationEdits( zoneLocationEdits, currentLocationEdits ) ).to.deep.equal(
			zoneLocationEdits
		);
	} );

	test( 'should append the current journal entries to the saved journal entries', () => {
		const zoneLocationEdits = {
			journal: [ { action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' } ],
			states: null,
			postcode: '12345',
			pristine: false,
		};
		const currentLocationEdits = {
			journal: [
				{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
				{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' },
			],
			states: null,
			postcode: null,
			pristine: false,
		};

		expect( mergeLocationEdits( zoneLocationEdits, currentLocationEdits ) ).to.deep.equal( {
			journal: [
				{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'US' },
				{ action: JOURNAL_ACTIONS.REMOVE_COUNTRY, code: 'US' },
				{ action: JOURNAL_ACTIONS.ADD_COUNTRY, code: 'UK' },
			],
			states: null,
			postcode: null,
			pristine: false,
		} );
	} );

	test( 'should remove the postcode if it was removed in the current edits', () => {
		const zoneLocationEdits = {
			journal: [],
			states: null,
			postcode: '12345',
			pristine: false,
		};
		const currentLocationEdits = {
			journal: [],
			states: null,
			postcode: null,
			pristine: false,
		};

		expect( mergeLocationEdits( zoneLocationEdits, currentLocationEdits ).postcode ).to.be.null;
	} );

	test( 'should always overwrite the postcode', () => {
		const zoneLocationEdits = {
			journal: [],
			states: null,
			postcode: '12345',
			pristine: false,
		};
		const currentLocationEdits = {
			journal: [],
			states: null,
			postcode: '54321',
			pristine: false,
		};

		expect( mergeLocationEdits( zoneLocationEdits, currentLocationEdits ).postcode ).to.equal(
			'54321'
		);
	} );

	test( 'should merge the states add and remove operations', () => {
		const zoneLocationEdits = {
			journal: [],
			states: {
				add: [ 'CA' ],
				remove: [ 'NY' ],
				removeAll: true,
			},
			postcode: null,
			pristine: false,
		};
		const currentLocationEdits = {
			journal: [],
			states: {
				add: [ 'NY' ],
				remove: [ 'UT', 'AZ' ],
				removeAll: false,
			},
			postcode: null,
			pristine: false,
		};

		expect( mergeLocationEdits( zoneLocationEdits, currentLocationEdits ).states ).to.deep.equal( {
			add: [ 'CA', 'NY' ],
			remove: [ 'UT', 'AZ' ],
			removeAll: true,
		} );
	} );

	test( 'should clean the old states if the current changes have the "removeAll" flag set', () => {
		const zoneLocationEdits = {
			journal: [],
			states: {
				add: [ 'CA' ],
				remove: [ 'NY' ],
				removeAll: false,
			},
			postcode: null,
			pristine: false,
		};
		const currentLocationEdits = {
			journal: [],
			states: {
				add: [ 'NY' ],
				remove: [ 'UT', 'AZ' ],
				removeAll: true,
			},
			postcode: null,
			pristine: false,
		};

		expect( mergeLocationEdits( zoneLocationEdits, currentLocationEdits ).states ).to.deep.equal( {
			add: [ 'NY' ],
			remove: [ 'UT', 'AZ' ],
			removeAll: true,
		} );
	} );
} );
