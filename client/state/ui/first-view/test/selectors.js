/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	doesViewHaveFirstView,
	isViewEnabled,
	wasViewHidden,
	switchedFromDifferentSection
} from '../selectors';
import {
	ROUTE_SET
} from 'state/action-types';

describe( 'selectors', () => {
	describe( '#doesViewHaveFirstView()', () => {
		it( 'should return false if the the first view is not listed along with its start date', () => {
			const hasFirstView = doesViewHaveFirstView( 'devdocs' );

			expect( hasFirstView ).to.be.false;
		} );

		it( 'should return true if the the first view is listed along with its start date', () => {
			const hasFirstView = doesViewHaveFirstView( 'stats' );

			expect( hasFirstView ).to.be.true;
		} );
	} );

	describe( '#isViewEnabled()', () => {
		it( 'should return true if the view has a first view and it is not disabled', () => {
			const viewEnabled = isViewEnabled( {
				preferences: {
					values: {
						firstViewHistory: [
							{
								view: 'stats',
								timestamp: 123456,
								disabled: false
							}
						]
					}
				}
			}, 'stats' );

			expect( viewEnabled ).to.be.true;
		} );

		it( 'should return true if the history is empty', () => {
			const viewEnabled = isViewEnabled( {
				preferences: {
					values: {
						firstViewHistory: []
					}
				}
			}, 'stats' );

			expect( viewEnabled ).to.be.true;
		} );

		it( 'should return false if the view is disabled', () => {
			const viewEnabled = isViewEnabled( {
				preferences: {
					values: {
						firstViewHistory: [
							{
								view: 'stats',
								timestamp: 123456,
								disabled: true
							}
						]
					}
				}
			}, 'stats' );

			expect( viewEnabled ).to.be.false;
		} );

		it( 'should return false if the view has no first view', () => {
			const viewEnabled = isViewEnabled( {
				preferences: {
					values: {
						firstViewHistory: []
					}
				}
			}, 'devdocs' );

			expect( viewEnabled ).to.be.false;
		} );
	} );

	describe( '#wasViewHidden()', () => {
		it( 'should return true if the view was hidden', () => {
			const wasHidden = wasViewHidden( {
				ui: {
					firstView: {
						hidden: [ 'stats' ]
					}
				}
			}, 'stats' );

			expect( wasHidden ).to.be.true;
		} );

		it( 'should return false if the view was not hidden', () => {
			const wasHidden = wasViewHidden( {
				ui: {
					firstView: {
						hidden: [ 'stats' ]
					}
				}
			}, 'devdocs' );

			expect( wasHidden ).to.be.false;
		} );
	} );

	describe( '#switchedFromDifferentSection()', () => {
		it( 'should return true if the user navigated from a different section', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/devdocs',
				},
				{
					type: ROUTE_SET,
					path: '/stats',
				},
			];

			const hasSwitchedSections = switchedFromDifferentSection( {
				ui: {
					section: {
						paths: [ '/stats' ]
					},
					actionLog: actions
				}
			}, 'stats' );

			expect( hasSwitchedSections ).to.be.true;
		} );

		it( 'should return false if the user has not navigated from a different section', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats/insights',
				},
				{
					type: ROUTE_SET,
					path: '/stats',
				}
			];

			const hasSwitchedSections = switchedFromDifferentSection( {
				ui: {
					section: {
						paths: [ '/stats' ]
					},
					actionLog: actions
				}
			}, 'stats' );

			expect( hasSwitchedSections ).to.be.false;
		} );
	} );
} );
