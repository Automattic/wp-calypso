import { setEnglishCanonicalUrl, setLocalizedCanonicalUrl } from '../localized-links';

jest.mock( 'calypso/server/lib/performance-mark', () => jest.fn() );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isUserLoggedIn: jest.fn( () => false ),
} ) );

const getCanonicalHref = ( middleware, originalUrl, localeSlug = 'en' ) => {
	const dispatch = jest.fn();
	const next = jest.fn();
	const context = {
		isServerSide: true,
		originalUrl,
		i18n: { getLocaleSlug: () => localeSlug },
		store: { dispatch, getState: () => ( {} ) },
	};

	middleware( context, next );

	expect( next ).toHaveBeenCalledTimes( 1 );
	expect( dispatch ).toHaveBeenCalledTimes( 1 );

	return dispatch.mock.calls[ 0 ][ 0 ].link.href;
};

describe( 'setEnglishCanonicalUrl', () => {
	it.each( [
		[ '/plugins', 'https://wordpress.com/plugins' ],
		[ '/plugins/', 'https://wordpress.com/plugins' ],
		[ '/es/plugins/', 'https://wordpress.com/plugins' ],
		[ '/plugins/browse/seo/', 'https://wordpress.com/plugins/browse/seo' ],
		[ '/plugins/jetpack/', 'https://wordpress.com/plugins/jetpack' ],
		[ '/plugins?s=seo', 'https://wordpress.com/plugins?s=seo' ],
		[ '/plugins/?s=seo', 'https://wordpress.com/plugins?s=seo' ],
	] )( 'sets the canonical URL of %s without a trailing slash', ( originalUrl, expected ) => {
		expect( getCanonicalHref( setEnglishCanonicalUrl, originalUrl ) ).toBe( expected );
	} );
} );

describe( 'setLocalizedCanonicalUrl', () => {
	it.each( [
		[ '/themes', 'en', 'https://wordpress.com/themes' ],
		[ '/themes/', 'en', 'https://wordpress.com/themes' ],
		[ '/es/themes/', 'es', 'https://wordpress.com/es/themes' ],
		[ '/es/themes?s=blog', 'es', 'https://wordpress.com/es/themes?s=blog' ],
	] )(
		'sets the canonical URL of %s (%s) without a trailing slash',
		( originalUrl, locale, expected ) => {
			expect( getCanonicalHref( setLocalizedCanonicalUrl, originalUrl, locale ) ).toBe( expected );
		}
	);
} );
