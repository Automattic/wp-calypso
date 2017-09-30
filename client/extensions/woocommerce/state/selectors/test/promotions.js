/**
 * External dependencies
 */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getPromotion,
	getPromotionEdits,
	getPromotionWithLocalEdits,
	getPromotions,
	getPromotionsPage,
	getPromotionsCurrentPage,
	getPromotionsPerPage,
	getCurrentlyEditingPromotionId,
} from '../promotions';

describe( 'promotions', () => {
	const rootState = {
		extensions: {
			woocommerce: {
				ui: {
					promotions: {
						list: {
							currentPage: 12,
							perPage: 30,
						}
					}
				},
				sites: {
					123: {
						promotions: {
							promotions: [
								{ id: 'id1', type: 'empty1' },
								{ id: 'id2', type: 'empty2' },
								{ id: 'id3', type: 'empty3' },
							]
						}
					}
				}
			}
		}
	};

	describe( '#getPromotions', () => {
		it( 'should return promotions for a given site.', () => {
			const promotions = getPromotions( rootState, 123 );

			expect( promotions ).to.exist;
			expect( promotions[ 0 ].type ).to.equal( 'empty1' );
			expect( promotions[ 1 ].type ).to.equal( 'empty2' );
			expect( promotions[ 2 ].type ).to.equal( 'empty3' );
		} );
	} );

	describe( '#getPromotion', () => {
		it( 'should return promotion for a given id.', () => {
			const promotion = getPromotion( rootState, 'id2', 123 );

			expect( promotion ).to.exist;
			expect( promotion.id ).to.equal( 'id2' );
			expect( promotion.type ).to.equal( 'empty2' );
		} );

		it( 'should return null for an id that is not found.', () => {
			const promotion = getPromotion( rootState, 'notthere', 123 );

			expect( promotion ).to.be.null;
		} );
	} );

	describe( '#getPromotionsPage', () => {
		it( 'should return only promotions for a given page.', () => {
			const page = getPromotionsPage( rootState, 123, 1, 2 );

			expect( page ).to.exist;
			expect( page.length ).to.equal( 2 );
			expect( page[ 0 ].type ).to.equal( 'empty1' );
			expect( page[ 1 ].type ).to.equal( 'empty2' );
		} );

		it( 'should advance the offset for pages > 1.', () => {
			const page = getPromotionsPage( rootState, 123, 2, 2 );

			expect( page ).to.exist;
			expect( page.length ).to.equal( 1 );
			expect( page[ 0 ].type ).to.equal( 'empty3' );
		} );
	} );

	describe( '#getPromotionsCurrentPage', () => {
		it( 'should return the current viewing page.', () => {
			const page = getPromotionsCurrentPage( rootState );
			expect( page ).to.equal( 12 );
		} );
	} );

	describe( '#getPromotionsPerPage', () => {
		it( 'should return the per-page setting for promotions.', () => {
			const perPage = getPromotionsPerPage( rootState );
			expect( perPage ).to.equal( 30 );
		} );
	} );

	describe( '#getCurrentlyEditingPromotionId', () => {
		it( 'should return null if nothing is being edited', () => {
			const id = getCurrentlyEditingPromotionId( rootState, 123 );
			expect( id ).to.be.null;
		} );

		it( 'should return the id of the last edited promotion', () => {
			const editedState = cloneDeep( rootState );
			editedState.extensions.woocommerce.ui.promotions.edits = {
				[ 123 ]: {
					creates: [
						{ id: 'id4', type: 'empty4' },
					],
					currentlyEditingId: 'id4',
				}
			};

			const id = getCurrentlyEditingPromotionId( editedState, 123 );
			expect( id ).to.equal( 'id4' );
		} );
	} );

	describe( '#getPromotionWithLocalEdits', () => {
		it( 'should return null if no edits are found for a given id', () => {
			const edits = getPromotionEdits( rootState, 'notthere', 123 );

			expect( edits ).to.be.null;
		} );

		it( 'should return edits for a given id', () => {
			const editedState = cloneDeep( rootState );
			editedState.extensions.woocommerce.ui.promotions.edits = {
				[ 123 ]: {
					updates: [
						{ id: 'id3', type: 'empty33' },
					],
					currentlyEditingId: 'id3',
				}
			};

			const edits = getPromotionEdits( editedState, 'id3', 123 );

			expect( edits ).to.exist;
			expect( edits.id ).to.equal( 'id3' );
			expect( edits.type ).to.equal( 'empty33' );
		} );
	} );

	describe( '#getPromotionWithLocalEdits', () => {
		it( 'should return null if a promotion is not found by the id provided', () => {
			const editedPromotion = getPromotionWithLocalEdits( rootState, 'notthere', 123 );

			expect( editedPromotion ).to.be.null;
		} );

		it( 'should return an unedited promotion as-is', () => {
			const editedPromotion = getPromotionWithLocalEdits( rootState, 'id3', 123 );

			expect( editedPromotion ).to.exist;
			expect( editedPromotion.id ).to.equal( 'id3' );
			expect( editedPromotion.type ).to.equal( 'empty3' );
		} );

		it( 'should return a promotion with edits overlaid on it', () => {
			const editedState = cloneDeep( rootState );
			editedState.extensions.woocommerce.ui.promotions.edits = {
				[ 123 ]: {
					updates: [
						{ id: 'id3', type: 'empty33' },
					],
					currentlyEditingId: 'id3',
				}
			};

			const editedPromotion = getPromotionWithLocalEdits( editedState, 'id3', 123 );

			expect( editedPromotion ).to.exist;
			expect( editedPromotion.id ).to.equal( 'id3' );
			expect( editedPromotion.type ).to.equal( 'empty33' );
		} );
	} );
} );

