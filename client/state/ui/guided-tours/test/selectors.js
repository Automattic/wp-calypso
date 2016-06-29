/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getGuidedTourState,
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
				},
				preferences: {
					values: {
						'guided-tours-history': [],
					},
				},
			} );

			expect( tourState ).to.deep.equal( { shouldShow: false, stepConfig: false, nextStepConfig: false } );
		} );

		it( 'should include the config of the current tour step', () => {
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
} );
