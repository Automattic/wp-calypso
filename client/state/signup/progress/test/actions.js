import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from '../actions';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( { type: 'ANALYTICS_EVENT_RECORD' } ) ),
} ) );
jest.mock( '@automattic/viewport', () => ( {
	resolveDeviceTypeByViewPort: () => 'desktop',
} ) );

describe( 'submitSignupStep', () => {
	it( 'records cart items as their product slugs', () => {
		submitSignupStep(
			{ stepName: 'plans-site-selected' },
			{
				cartItems: [ { product_slug: 'business-bundle' }, { product_slug: 'jetpack_backup' } ],
			}
		)( jest.fn(), () => ( {} ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_signup_actions_submit_step',
			expect.objectContaining( {
				step: 'plans-site-selected',
				cart_items: 'business-bundle,jetpack_backup',
			} )
		);
	} );
} );
