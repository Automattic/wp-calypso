/**
 * External dependencies
 */
import { expect } from 'chai';
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	areOrderNotesLoaded,
	areOrderNotesLoading,
	getOrderNotes,
	isOrderNoteSaving,
} from '../selectors';
import notes from './fixtures/notes';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};
const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						notes: {
							isLoading: {
								45: true,
							},
							isSaving: {
								45: true,
							},
							items: {},
							orders: {},
						},
					},
				},
			},
		},
	},
};
const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						notes: {
							isLoading: {
								45: false,
							},
							isSaving: {
								20: false,
							},
							items: keyBy( notes, 'id' ),
							orders: {
								45: [ 1, 2 ],
							},
						},
					},
				},
			},
		},
	},
};

const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areOrderNotesLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areOrderNotesLoaded( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be false when notes are currently being fetched for this order.', () => {
			expect( areOrderNotesLoaded( loadingState, 45, 123 ) ).to.be.false;
		} );

		test( 'should be true when notes are loaded for this order.', () => {
			expect( areOrderNotesLoaded( loadedState, 45, 123 ) ).to.be.true;
		} );

		test( 'should be false when notes are loaded only for a different order.', () => {
			expect( areOrderNotesLoaded( loadedState, 20, 123 ) ).to.be.false;
		} );

		test( 'should be false when notes are loaded only for a different site.', () => {
			expect( areOrderNotesLoaded( loadedState, 20, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areOrderNotesLoaded( loadedStateWithUi, 45 ) ).to.be.true;
		} );
	} );

	describe( '#areOrderNotesLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areOrderNotesLoading( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be true when notes are currently being fetched for this order.', () => {
			expect( areOrderNotesLoading( loadingState, 45, 123 ) ).to.be.true;
		} );

		test( 'should be false when notes are loaded for this order.', () => {
			expect( areOrderNotesLoading( loadedState, 45, 123 ) ).to.be.false;
		} );

		test( 'should be false when notes are loaded only for a different order.', () => {
			expect( areOrderNotesLoading( loadedState, 20, 123 ) ).to.be.false;
		} );

		test( 'should be false when notes are loaded only for a different site.', () => {
			expect( areOrderNotesLoading( loadedState, 20, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areOrderNotesLoading( loadedStateWithUi, 45 ) ).to.be.false;
		} );
	} );

	describe( '#getOrderNotes', () => {
		test( 'should be an empty array when woocommerce state is not available.', () => {
			expect( getOrderNotes( preInitializedState, 1, 123 ) ).to.be.empty;
		} );

		test( 'should be an empty array when orders are loading.', () => {
			expect( getOrderNotes( loadingState, 45, 123 ) ).to.be.empty;
		} );

		test( 'should be the list of notes if they are loaded.', () => {
			expect( getOrderNotes( loadedState, 45, 123 ) ).to.eql( notes );
		} );

		test( 'should be an empty array when notes are loaded only for a different order.', () => {
			expect( getOrderNotes( loadedState, 20, 123 ) ).to.be.empty;
		} );

		test( 'should be an empty array when notes are loaded only for a different site.', () => {
			expect( getOrderNotes( loadedState, 20, 456 ) ).to.be.empty;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getOrderNotes( loadedStateWithUi, 45 ) ).to.eql( notes );
		} );
	} );

	describe( '#isOrderNoteSaving', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( isOrderNoteSaving( preInitializedState, 1, 123 ) ).to.be.false;
		} );

		test( 'should be true when a note is currently being saved for this order.', () => {
			expect( isOrderNoteSaving( loadingState, 45, 123 ) ).to.be.true;
		} );

		test( 'should be false when saving a note is completed for this order.', () => {
			expect( isOrderNoteSaving( loadedState, 45, 123 ) ).to.be.false;
		} );

		test( 'should be false when a note has been saved for a different order.', () => {
			expect( isOrderNoteSaving( loadedState, 20, 123 ) ).to.be.false;
		} );

		test( 'should be false when a note has been saved for a different site.', () => {
			expect( isOrderNoteSaving( loadedState, 20, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isOrderNoteSaving( loadedStateWithUi, 45 ) ).to.be.false;
		} );
	} );
} );
