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
import useI18n from 'test/helpers/use-i18n';

describe( 'selectors', () => {
	describe( '#getGuidedTourState()', () => {
		useI18n();
		it( 'should return an empty object if no state is present', () => {
			const tourState = getGuidedTourState( {
				ui: {
					shouldShow: false,
					guidedTour: false,
				}
			} );

			expect( tourState ).to.deep.equal( { shouldShow: false, stepConfig: false } );
		} );

		it( 'should include the config of the current tour step', () => {
			const tourState = getGuidedTourState( {
				ui: {
					guidedTour: {
						stepName: 'sidebar',
						shouldShow: true,
						tour: 'main',
					}
				}
			} );

			const stepConfig = guidedToursConfig.get().sidebar;

			expect( tourState ).to.deep.equal( Object.assign( {}, tourState, {
				stepConfig
			} ) );
		} );
	} );
} );
