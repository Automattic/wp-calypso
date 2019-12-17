/**
 * Internal dependencies
 */
import { SITE_LAUNCH } from 'state/action-types';
import { launchSite } from 'state/sites/launch/actions';

describe( 'actions', () => {
	describe( '#launchSite', () => {
		test( 'should return a thunk action when a site is launched', () => {
			const dispatch = jest.fn();
			launchSite( 123 )( dispatch );
			expect( dispatch ).toHaveBeenCalledWith( {
				type: SITE_LAUNCH,
				siteId: 123,
			} );
		} );

		test( 'returns true if the site was launched', async () => {
			const getState = () => ( {
				sites: {
					items: { '123': { launch_status: 'launched' } },
				},
			} );

			const launched = await launchSite( 123 )( jest.fn(), getState );

			expect( launched ).toBe( true );
		} );

		test( 'returns false if the site was not launched', async () => {
			const getState = () => ( {
				sites: {
					items: { '123': { launch_status: 'unlaunched' } },
				},
			} );

			const launched = await launchSite( 123 )( jest.fn(), getState );

			expect( launched ).toBe( false );
		} );
	} );
} );
