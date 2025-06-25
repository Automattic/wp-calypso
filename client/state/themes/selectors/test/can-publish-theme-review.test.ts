// @ts-nocheck - TODO: Fix TypeScript issues
import * as userSelectors from 'calypso/state/current-user/selectors';
import * as themeSelectors from 'calypso/state/themes/selectors';
import { canPublishThemeReview } from '../can-publish-theme-review';

jest.mock( 'calypso/state/current-user/selectors' );
jest.mock( 'calypso/state/themes/selectors' );

describe( 'canPublishThemeReview', () => {
	it( 'returns true if the user is logged in and the theme is not externally managed', () => {
		userSelectors.isUserLoggedIn.mockReturnValue( true );
		themeSelectors.isExternallyManagedTheme.mockReturnValue( false );

		const result = canPublishThemeReview( {}, 'theme1' );

		expect( result ).toBe( true );
	} );

	it( 'returns false if the user is not logged in', () => {
		userSelectors.isUserLoggedIn.mockReturnValue( false );

		const result = canPublishThemeReview( {}, 'theme1' );

		expect( result ).toBe( false );
	} );

	it( 'returns true if the user is logged in and has a subscription for an externally managed theme', () => {
		userSelectors.isUserLoggedIn.mockReturnValue( true );
		themeSelectors.isExternallyManagedTheme.mockReturnValue( true );
		themeSelectors.isMarketplaceThemeSubscribedByUser.mockReturnValue( true );

		const result = canPublishThemeReview( {}, 'theme1' );

		expect( result ).toBe( true );
	} );

	it( 'returns false if the user is logged in but does not have a subscription for an externally managed theme', () => {
		userSelectors.isUserLoggedIn.mockReturnValue( true );
		themeSelectors.isExternallyManagedTheme.mockReturnValue( true );
		themeSelectors.isMarketplaceThemeSubscribedByUser.mockReturnValue( false );

		const result = canPublishThemeReview( {}, 'theme1' );

		expect( result ).toBe( false );
	} );
} );
