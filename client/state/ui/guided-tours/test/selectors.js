/**
 * External dependencies
 */
import { expect } from 'chai';
import { constant, times } from 'lodash';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';
import { shouldViewBeVisible } from 'state/ui/first-view/selectors';
import { useFakeTimers } from 'test/helpers/use-sinon';

describe( 'selectors', () => {
	let clock;
	let getGuidedTourState;
	let findEligibleTour;
	let hasTourJustBeenVisible;

	useFakeDom();

	useFakeTimers( fakeClock => {
		clock = fakeClock;
	} );

	useMockery( mockery => {
		mockery.registerSubstitute(
				'layout/guided-tours/config',
				'state/ui/guided-tours/test/fixtures/config' );

		const selectors = require( '../selectors' );
		getGuidedTourState = selectors.getGuidedTourState;
		findEligibleTour = selectors.findEligibleTour;
		hasTourJustBeenVisible = selectors.hasTourJustBeenVisible;
	} );

	describe( '#isConflictingWithFirstView', () => {
		const now = 1479741854095;

		const withEligibleFirstView = {
			currentUser: {
				id: 73705554
			},
			users: {
				items: {
					73705554: { ID: 73705554, login: 'testonesite2016', date: '2016-10-18T17:14:52+00:00' }
				}
			},
			ui: {
				actionLog: [ {
					type: 'ROUTE_SET',
					path: '/stats'
				} ],
				queryArguments: {
					initial: {}
				},
				section: {
					name: 'stats',
					paths: [ '/stats' ]
				}
			},
			preferences: {
				remoteValues: {
					firstViewHistory: [],
					'guided-tours-history': [],
				},
				lastFetchedTimestamp: now
			}
		};

		const withFirstViewAndTourRequest = {
			...withEligibleFirstView,
			ui: {
				...withEligibleFirstView.ui,
				queryArguments: {
					initial: {
						tour: 'main'
					}
				}
			}
		};

		const havingJustSeenTour = {
			...withEligibleFirstView,
			ui: {
				...withEligibleFirstView.ui,
				actionLog: [
					...withEligibleFirstView.ui.actionLog,
					{
						type: 'FIRST_VIEW_HIDE',
						view: 'stats',
						timestamp: now - 120000,
					},
					{
						type: 'GUIDED_TOUR_UPDATE',
						shouldShow: false,
						timestamp: now - 30000,
					}
				],
			},
			preferences: {
				remoteValues: {
					firstViewHistory: [ {
						view: 'stats',
						timestamp: now - 30000
					} ]
				},
				lastFetchedTimestamp: now - 10000
			}
		};

		const havingSeenTourEarlier = {
			...withEligibleFirstView,
			ui: {
				...withEligibleFirstView.ui,
				actionLog: [
					...withEligibleFirstView.ui.actionLog,
					{
						type: 'FIRST_VIEW_HIDE',
						view: 'stats',
						timestamp: now - 120000,
					},
					{
						type: 'GUIDED_TOUR_UPDATE',
						shouldShow: false,
						timestamp: now - 120000,
					}
				],
			},
			preferences: {
				remoteValues: {
					firstViewHistory: [ {
						view: 'stats',
						timestamp: now - 120000
					} ]
				},
				lastFetchedTimestamp: now - 10000
			}
		};

		it( 'expects shouldViewBeVisible to work normally', () => {
			expect( shouldViewBeVisible( withEligibleFirstView ) ).to.be.true;
		} );

		it( 'should short-circuit findEligibleTour', () => {
			clock.tick( now );
			expect( findEligibleTour( withFirstViewAndTourRequest ) ).to.be.undefined;
			expect( findEligibleTour( havingJustSeenTour ) ).to.be.undefined;
		} );

		it( 'should reallow tours after a while', () => {
			expect( findEligibleTour( havingSeenTourEarlier ) ).to.equal( 'stats' );
		} );
	} );

	describe( '#hasTourJustBeenVisible', () => {
		it( 'should return false when no tour has been seen', () => {
			const state = { ui: { actionLog: [] } };
			expect( hasTourJustBeenVisible( state ) ).to.be.undefined;
		} );

		it( 'should return true when a tour has just been seen', () => {
			const now = 1478623930204;
			const state = {
				ui: {
					actionLog: [ {
						type: 'GUIDED_TOUR_UPDATE',
						shouldShow: false,
						timestamp: now - 10000, // 10 seconds earlier
					} ]
				}
			};
			expect( hasTourJustBeenVisible( state, now ) ).to.be.true;
		} );

		it( 'should return false when a tour has been seen longer ago', () => {
			const now = 1478623930204;
			const state = {
				ui: {
					actionLog: [ {
						type: 'GUIDED_TOUR_UPDATE',
						shouldShow: false,
						timestamp: now - 120000, // 2 minutes earlier
					} ]
				}
			};
			expect( hasTourJustBeenVisible( state, now ) ).to.be.falsey;
		} );
	} );

	describe( '#getGuidedTourState()', () => {
		it( 'should return an empty object if no state is present', () => {
			const tourState = getGuidedTourState( {
				ui: {
					shouldShow: false,
					guidedTour: false,
					actionLog: [],
					queryArguments: {
						initial: {},
					},
				},
				preferences: {
					lastFetchedTimestamp: 1,
					remoteValues: {
						'guided-tours-history': [],
					},
				},
			} );

			expect( tourState ).to.deep.equal( { shouldShow: false } );
		} );
	} );
	describe( '#findEligibleTour()', () => {
		const makeState = ( {
			actionLog = [],
			toursHistory = [],
			queryArguments = {},
			userData = {},
		} ) => ( {
			ui: {
				actionLog,
				queryArguments: {
					initial: queryArguments,
				},
			},
			preferences: {
				lastFetchedTimestamp: 1,
				remoteValues: {
					'guided-tours-history': toursHistory,
				},
			},
			currentUser: { id: 1337 },
			users: {
				items: {
					1337: {
						date: '2015-11-20T00:00:00+00:00',
						...userData,
					},
				},
			},
		} );

		const navigateToThemes = {
			type: 'ROUTE_SET',
			path: '/themes/77203074',
		};

		const navigateToTest = {
			type: 'ROUTE_SET',
			path: '/test',
		};

		const mainTourStarted = {
			type: 'GUIDED_TOUR_UPDATE',
			tour: 'main',
		};

		const mainTourAborted = {
			type: 'GUIDED_TOUR_UPDATE',
			shouldShow: false,
			shouldReallyShow: false,
			tour: 'main',
			stepName: 'init',
			finished: false,
		};

		const mainTourSeen = {
			tourName: 'main',
			timestamp: 1337,
			finished: true,
		};

		const themesTourSeen = {
			tourName: 'themes',
			timestamp: 1337,
			finished: true,
		};

		const testTourSeen = {
			tourName: 'test',
			timestamp: 1337,
			finished: true,
		};

		it( 'should return undefined if nothing relevant in log', () => {
			const state = makeState( { actionLog: [ { type: 'IRRELEVANT' } ] } );
			const tour = findEligibleTour( state );

			expect( tour ).to.equal( undefined );
		} );
		it( 'should find `themes` when applicable', () => {
			const state = makeState( { actionLog: [ navigateToThemes ] } );
			const tour = findEligibleTour( state );

			expect( tour ).to.equal( 'themes' );
		} );
		it( 'should not find `themes` if previously seen', () => {
			const state = makeState( {
				actionLog: [ navigateToThemes ],
				toursHistory: [ themesTourSeen ],
			} );

			const tour = findEligibleTour( state );

			expect( tour ).to.equal( undefined );
		} );
		it( 'should see to it that an ongoing tour is selected', () => {
			const havingStartedTour = makeState( {
				actionLog: [ mainTourStarted, navigateToThemes ],
			} );
			const havingQuitTour = makeState( {
				actionLog: [ mainTourStarted, mainTourAborted, navigateToThemes ],
			} );

			expect( findEligibleTour( havingStartedTour ) ).to.equal( 'main' );
			expect( findEligibleTour( havingQuitTour ) ).to.equal( 'themes' );
		} );
		it( 'should favor a tour launched via query arguments', () => {
			const state = makeState( {
				actionLog: [ navigateToThemes ],
				toursHistory: [ mainTourSeen, themesTourSeen ],
				queryArguments: { tour: 'main' }
			} );
			const tour = findEligibleTour( state );

			expect( tour ).to.equal( 'main' );
		} );
		it( 'should dismiss a requested tour at the end', () => {
			const mainTourJustSeen = {
				tourName: 'main',
				timestamp: 1338,
				finished: true,
			};
			const state = makeState( {
				actionLog: [ navigateToThemes ],
				toursHistory: [ themesTourSeen, mainTourJustSeen ],
				queryArguments: { tour: 'main', _timestamp: 0 }
			} );
			const tour = findEligibleTour( state );

			expect( tour ).to.equal( undefined );
		} );
		it( 'should respect tour "when" conditions', () => {
			const state = makeState( {
				actionLog: [ navigateToThemes ],
				userData: { date: ( new Date() ).toJSON() }, // user was created just now
			} );
			const tour = findEligibleTour( state );

			// Even though we navigated to `/themes`, this counts as navigating
			// to `/`, and `state` satisfies `main`'s "when" condition that the user
			// should be a new user. In our config, `main` is declared before
			// `themes`, so the selector should prefer the former.
			expect( tour ).to.equal( 'main' );
		} );
		it( 'shouldn\'t show a requested tour twice', () => {
			/*
			 * Assume that a lot has happened during a Calypso session, so the
			 * action log doesn't contain actions specific to Guided Tours
			 * anymore.
			 */
			const state = makeState( {
				actionLog: times( 50, constant( navigateToTest ) ),
				toursHistory: [ testTourSeen, themesTourSeen ],
				queryArguments: { tour: 'themes', _timestamp: 0 }
			} );
			const tour = findEligibleTour( state );

			expect( tour ).to.equal( undefined );
		} );
		it( 'should bail if user preferences are stale', () => {
			const state = makeState( {
				actionLog: [ navigateToThemes ],
				userData: { date: ( new Date() ).toJSON() }, // user was created just now
			} );
			delete state.preferences.lastFetchedTimestamp;
			const tour = findEligibleTour( state );

			expect( tour ).to.equal( undefined );
		} );
		describe( 'picking a tour based on the most recent actions', () => {
			it( 'should pick `themes`', () => {
				const state = makeState( {
					actionLog: [ navigateToThemes, navigateToTest ]
				} );
				const tour = findEligibleTour( state );

				expect( tour ).to.equal( 'test' );
			} );
			it( 'should pick `test`', () => {
				const state = makeState( {
					actionLog: [ navigateToTest, navigateToThemes ]
				} );
				const tour = findEligibleTour( state );

				expect( tour ).to.equal( 'themes' );
			} );
		} );
	} );
} );
