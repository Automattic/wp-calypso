/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isUserEligible,
	getConfigForCurrentView,
	isViewEnabled,
	wasFirstViewHiddenSinceEnteringCurrentSection,
	secondsSpentOnCurrentView,
	bucketedTimeSpentOnCurrentView,
} from '../selectors';
import {
	FIRST_VIEW_HIDE,
	ROUTE_SET
} from 'state/action-types';

describe( 'isUserEligible()', () => {
	it( 'makes all users eligible if no start date is defined in the config', () => {
		const state = {
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2014', date: '2014-10-18T17:14:52+00:00' }
				}
			},
			currentUser: {
				id: 73705554
			}
		};
		const eligible = isUserEligible( state, {} );

		expect( eligible ).to.be.true;
	} );

	it( 'does not show the first view if the user does not have a start date', () => {
		const state = {
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2014' }
				}
			},
			currentUser: {
				id: 73705554
			}
		};
		const config = { name: 'stats', paths: [ '/stats' ], enabled: true, startDate: '2016-07-26' };
		const eligible = isUserEligible( state, config );

		expect( eligible ).to.be.false;
	} );

	it( 'shows the first view if the user registered after the first view start date', () => {
		const state = {
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2014', date: '2016-07-27T17:14:52+00:00' }
				}
			},
			currentUser: {
				id: 73705554
			}
		};
		const config = { name: 'stats', paths: [ '/stats' ], enabled: true, startDate: '2016-07-26' };
		const eligible = isUserEligible( state, config );

		expect( eligible ).to.be.true;
	} );

	it( 'does not show the first view if the user registered before the first view start date', () => {
		const state = {
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2014', date: '2016-07-25T17:14:52+00:00' }
				}
			},
			currentUser: {
				id: 73705554
			}
		};
		const config = { name: 'stats', paths: [ '/stats' ], enabled: true, startDate: '2016-07-26' };
		const eligible = isUserEligible( state, config );

		expect( eligible ).to.be.false;
	} );
} );

describe( 'selectors', () => {
	describe( '#getConfigForCurrentView()', () => {
		it( 'should return false if there is no first view config for the active path', () => {
			const firstViewConfig = getConfigForCurrentView( {
				ui: {
					actionLog: [
						{
							type: ROUTE_SET,
							path: '/devdocs',
						}
					],
					queryArguments: {
						initial: {},
					},
				}
			} );

			expect( firstViewConfig ).to.be.false;
		} );

		it( 'should return the stats config object when the stats first view is enabled and the most recent route is a stats page', () => {
			const firstViewConfig = getConfigForCurrentView( {
				ui: {
					actionLog: [
						{
							type: ROUTE_SET,
							path: '/stats',
						}
					],
					queryArguments: {
						initial: {},
					},
				}
			} );

			expect( firstViewConfig ).to.deep.equal( { name: 'stats', paths: [ '/stats' ], enabled: true, startDate: '2016-07-26' } );
		} );
	} );

	describe( '#isViewEnabled()', () => {
		const actions = [
			{
				type: ROUTE_SET,
				path: '/stats',
			}
		];

		const currentUser = {
			id: 73705554
		};

		const users = {
			items: {
				73705554: { ID: 73705554, login: 'testonesite2014', date: '2014-10-18T17:14:52+00:00' }
			}
		};

		const queryArguments = {
			initial: {}
		};

		const config = {
			name: 'stats',
			paths: [ '/stats' ],
			enabled: true,
		};

		it( 'should return true if the preferences have been fetched, the config has a first view for the current view,' +
			' and it is not disabled', () => {
			const viewEnabled = isViewEnabled( {
				currentUser,
				users,
				preferences: {
					values: {
						firstViewHistory: [
							{
								view: 'stats',
								timestamp: 123456,
								disabled: false
							}
						]
					},
					lastFetchedTimestamp: 123456,
				},
				ui: {
					actionLog: actions,
					queryArguments,
				}
			}, config );

			expect( viewEnabled ).to.be.true;
		} );

		it( 'should return true if preferences have been fetched and the history is empty', () => {
			const viewEnabled = isViewEnabled( {
				currentUser,
				users,
				preferences: {
					values: {
						firstViewHistory: []
					},
					lastFetchedTimestamp: 123456,
				},
				ui: {
					actionLog: actions,
					queryArguments,
				}
			}, config );

			expect( viewEnabled ).to.be.true;
		} );

		it( 'should return false if the view is disabled', () => {
			const viewEnabled = isViewEnabled( {
				currentUser,
				users,
				preferences: {
					values: {
						firstViewHistory: [
							{
								view: 'stats',
								timestamp: 123456,
								disabled: true
							}
						]
					},
					lastFetchedTimestamp: 123456,
				},
				ui: {
					actionLog: actions,
					queryArguments,
				}
			}, config );

			expect( viewEnabled ).to.be.false;
		} );

		it( 'should return false if the view is disabled in the config', () => {
			const viewEnabled = isViewEnabled( {
				currentUser,
				users,
				preferences: {
					values: {
						firstViewHistory: []
					},
					lastFetchedTimestamp: 123456,
				},
				ui: {
					actionLog: [
						{
							type: ROUTE_SET,
							path: '/devdocs',
						}
					],
					queryArguments,
				}
			}, { name: 'devdocs', paths: [ '/devdocs' ], enabled: false } );

			expect( viewEnabled ).to.be.false;
		} );

		it( 'should return false if the preferences haven\'t been fetched', () => {
			const viewEnabled = isViewEnabled( {
				currentUser,
				users,
				preferences: {
					values: {
						firstViewHistory: []
					},
					lastFetchedTimestamp: false,
				},
				ui: {
					actionLog: actions,
					queryArguments,
				}
			}, config );

			expect( viewEnabled ).to.be.false;
		} );
	} );

	describe( '#wasFirstViewHiddenSinceEnteringCurrentSection()', () => {
		const config = {
			name: 'stats',
			paths: [ '/stats' ],
			enabled: true,
		};

		it( 'should return true if the first view was hidden since entering the current section', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/devdocs',
				},
				{
					type: ROUTE_SET,
					path: '/stats',
				},
				{
					type: FIRST_VIEW_HIDE,
					view: 'stats',
				},
				{
					type: ROUTE_SET,
					path: '/stats/insights',
				},
			];

			const wasFirstViewHidden = wasFirstViewHiddenSinceEnteringCurrentSection( {
				ui: {
					section: {
						name: 'stats',
						paths: [ '/stats' ]
					},
					actionLog: actions
				}
			}, config );

			expect( wasFirstViewHidden ).to.be.true;
		} );

		it( 'should return false if the first view was not hidden since entering current section', () => {
			const actions = [
				{
					type: ROUTE_SET,
					path: '/devdocs',
				},
				{
					type: FIRST_VIEW_HIDE,
					view: 'devdocs',
				},
				{
					type: ROUTE_SET,
					path: '/stats',
				},
				{
					type: ROUTE_SET,
					path: '/stats/insights',
				},
			];

			const wasFirstViewHidden = wasFirstViewHiddenSinceEnteringCurrentSection( {
				ui: {
					section: {
						name: 'stats',
						paths: [ '/stats' ]
					},
					actionLog: actions
				}
			}, config );

			expect( wasFirstViewHidden ).to.be.false;
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
