/**
 * @jest-environment jsdom
 */
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { TRACKING_IDS } from '../ad-tracking/constants';
import { setup, firePageView } from '../ad-tracking/google-analytics-4';

jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud' );

describe( 'Google Analytics 4 implementation', () => {
	beforeAll( () => {
		jest.spyOn( window, 'gtag' ).mockImplementation( () => [] );
	} );

	describe( 'Google Analytics 4 initialization on Jetpack Cloud and WPcom', () => {
		test( 'Only fire Jetpack Gtag on Jetpack Cloud', () => {
			// We're on Jetpack Cloud.
			isJetpackCloud.mockReturnValue( true );
			const params = {};

			setup( params );
			expect( window.gtag ).toHaveBeenCalledWith(
				'config',
				TRACKING_IDS.jetpackGoogleGA4Gtag,
				params
			);
		} );
		test( 'Do not fire Jetpack Gtag on WPcom', () => {
			jest.spyOn( window, 'gtag' ).mockImplementation( () => [] );

			// We're not on Jetpack cloud.
			isJetpackCloud.mockReturnValue( false );
			const params = {};

			setup( params );
			expect( window.gtag ).toHaveBeenCalledWith(
				'config',
				TRACKING_IDS.wpcomGoogleGA4Gtag,
				params
			);
		} );
	} );

	describe( 'Google Analytics 4 Page View events are recorded on WPcom', () => {
		test( 'firePageView results in calling gtag with the expected params', () => {
			// WPcom.
			isJetpackCloud.mockReturnValue( false );

			const gtagParams = {
				send_to: TRACKING_IDS.wpcomGoogleGA4Gtag,
				page_title: 'home',
				page_location: '/',
			};

			firePageView( gtagParams.page_title, gtagParams.page_location, false );
			expect( window.gtag ).toHaveBeenCalledWith( 'event', 'page_view', gtagParams );
		} );
	} );
} );
