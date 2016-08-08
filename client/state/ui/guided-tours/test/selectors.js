/**
 * External dependencies
 */
import { expect } from 'chai';
import { constant, times } from 'lodash';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

describe( 'selectors', () => {
	let getGuidedTourState;
	let findEligibleTour;

	useMockery( mockery => {
		mockery.registerSubstitute(
				'layout/guided-tours/config',
				'state/ui/guided-tours/test/config' );

		const selectors = require( '../selectors' );
		getGuidedTourState = selectors.getGuidedTourState;
		findEligibleTour = selectors.findEligibleTour;
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
					values: {
						'guided-tours-history': [],
					},
				},
			} );

			expect( tourState ).to.deep.equal( { shouldShow: false, stepConfig: false, nextStepConfig: false } );
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
				values: {
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
			path: '/design/77203074',
		};

		const navigateToTest = {
			type: 'ROUTE_SET',
			path: '/test',
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
		it( 'should respect tour contexts', () => {
			const state = makeState( {
				actionLog: [ navigateToThemes ],
				userData: { date: ( new Date() ).toJSON() }, // user was created just now
			} );
			const tour = findEligibleTour( state );

			// Even though we navigated to `/themes`, this counts as navigating
			// to `/`, and `state` satisfies `main`'s context that the user
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
