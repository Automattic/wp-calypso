import { describe, expect, test } from '@jest/globals';
import { getCalypsoGetStartedUrlFromHref } from '../../../lib/pages/logged-out-themes-page';

describe( 'LoggedOutThemesPage', function () {
	describe( 'getCalypsoGetStartedUrlFromHref', function () {
		test.each< {
			currentUrl: string;
			getStartedRoute: string;
			expectedThemeSlug: string;
			expectedUrl: string;
		} >`
			currentUrl                               | getStartedRoute                                                                                | expectedThemeSlug | expectedUrl
			${ 'https://wordpress.com/themes/free' } | ${ '/start/with-theme?ref=calypshowcase&theme=primarium&theme_type=free&intervalType=yearly' } | ${ 'primarium' }  | ${ 'http://calypso.localhost:3000/start/with-theme?ref=calypshowcase&theme=primarium&theme_type=free&intervalType=yearly' }
			${ 'https://wordpress.com/themes/free' } | ${ 'https://wordpress.com/start/with-theme?theme=assembler&theme_type=free#step' }             | ${ 'assembler' }  | ${ 'http://calypso.localhost:3000/start/with-theme?theme=assembler&theme_type=free#step' }
		`(
			'returns a Calypso URL and theme slug for $getStartedRoute',
			function ( { currentUrl, getStartedRoute, expectedThemeSlug, expectedUrl } ) {
				expect( getCalypsoGetStartedUrlFromHref( getStartedRoute, currentUrl ) ).toEqual( {
					themeSlug: expectedThemeSlug,
					url: expectedUrl,
				} );
			}
		);

		test( 'throws when the href does not include a theme parameter', function () {
			expect( () =>
				getCalypsoGetStartedUrlFromHref(
					'/start/with-theme?ref=calypshowcase',
					'https://wordpress.com/themes/free'
				)
			).toThrow( 'Theme slug not found' );
		} );
	} );
} );
