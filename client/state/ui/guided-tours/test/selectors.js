/**
 * External dependencies
 */
import { expect } from 'chai';
import { constant, times } from 'lodash';

/**
 * Internal dependencies
 */
import {
	getGuidedTourState,
	findEligibleTour,
} from '../selectors';
import guidedToursConfig from 'layout/guided-tours/config';

describe( 'selectors', () => {
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

		// disabled because tours are now selected via `findEligibleTour`,
		// rather than direct guidedTour state
		xit( 'should include the config of the current tour step', () => {
			const tourState = getGuidedTourState( {
				ui: {
					guidedTour: {
						stepName: 'sidebar',
						shouldShow: true,
						tour: 'main',
					},
					actionLog: [],
				},
				preferences: {
					values: {
						'guided-tours-history': [],
					},
				},
			} );

			const stepConfig = guidedToursConfig.get( 'main' ).sidebar;

			expect( tourState ).to.deep.equal( Object.assign( {}, tourState, {
				stepConfig
			} ) );
		} );
	} );
	describe( '#findEligibleTour()', () => {
		const makeState = ( {
			actionLog = [],
			toursHistory = [],
			queryArguments = {},
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
				queryArguments: { tour: 'main', timestamp: 0 }
			} );
			const tour = findEligibleTour( state );

			expect( tour ).to.equal( undefined );
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
				queryArguments: { tour: 'themes', timestamp: 0 }
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
