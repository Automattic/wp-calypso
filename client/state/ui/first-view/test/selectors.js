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
	switchedFromDifferentSection,
	secondsSpentOnCurrentView,
	bucketedTimeSpentOnCurrentView,
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

	describe( '#secondsSpentOnCurrentView()', () => {
		it( 'should return -1 if the action log is empty', () => {
			const actions = [];

			const seconds = secondsSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			} );

			expect( seconds ).to.equal( -1 );
		} );

		it( 'should return 3 when now is 3000 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const seconds = secondsSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962293000 );

			expect( seconds ).to.equal( 3 );
		} );

		it( 'should return 5.678 when now is 5678 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats/insights',
					timestamp: 1468962221009,
				},
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const seconds = secondsSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962295678 );

			expect( seconds ).to.equal( 5.678 );
		} );
	} );

	describe( '#bucketedTimeSpentOnCurrentView()', () => {
		it( 'should return \'unknown\' when the action log is empty', () => {
			const actions = [];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			} );

			expect( bucket ).to.equal( 'unknown' );
		} );

		it( 'should return \'under2\' when now is 1999 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962291999 );

			expect( bucket ).to.equal( 'under2' );
		} );

		it( 'should return \'2-5\' when now is 2000 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962292000 );

			expect( bucket ).to.equal( '2-5' );
		} );

		it( 'should return \'2-5\' when now is 4999 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962294999 );

			expect( bucket ).to.equal( '2-5' );
		} );

		it( 'should return \'5-10\' when now is 5000 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962295000 );

			expect( bucket ).to.equal( '5-10' );
		} );

		it( 'should return \'5-10\' when now is 9999 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962299999 );

			expect( bucket ).to.equal( '5-10' );
		} );

		it( 'should return \'10-20\' when now is 10000 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962300000 );

			expect( bucket ).to.equal( '10-20' );
		} );

		it( 'should return \'10-20\' when now is 19999 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962309999 );

			expect( bucket ).to.equal( '10-20' );
		} );

		it( 'should return \'20-60\' when now is 20000 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962310000 );

			expect( bucket ).to.equal( '20-60' );
		} );

		it( 'should return \'20-60\' when now is 59999 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962349999 );

			expect( bucket ).to.equal( '20-60' );
		} );

		it( 'should return \'60plus\' when now is 60000 millis after the last action in the log', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/stats',
					timestamp: 1468962290000,
				}
			];

			const bucket = bucketedTimeSpentOnCurrentView( {
				ui: {
					actionLog: actions
				}
			}, 1468962350000 );

			expect( bucket ).to.equal( '60plus' );
		} );
	} );
} );
