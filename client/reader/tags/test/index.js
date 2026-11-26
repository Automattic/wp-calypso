/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { vi } from 'vitest';
import { redirectLoggedOutToDiscoverTags } from 'calypso/reader/controller';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import initTags from '../index';

vi.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: vi.fn(),
} ) );

vi.mock( '@automattic/i18n-utils', () => ( {
	getAnyLanguageRouteParam: () => ':lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})',
	getLanguageRouteParam: () => ':lang(en|fr)?',
} ) );

vi.mock( 'calypso/controller', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		makeLayout: vi.fn(),
		redirectInvalidLanguage: vi.fn(),
		redirectWithoutLocaleParamInFrontIfLoggedIn: vi.fn(),
		render: vi.fn(),
	} )
);

vi.mock( 'calypso/controller/shared', () => ( {
	setLocaleMiddleware: vi.fn( () => vi.fn() ),
} ) );

vi.mock( 'calypso/reader/controller', () => ( {
	redirectLoggedOutToDiscoverTags: vi.fn(),
	sidebar: vi.fn(),
} ) );

vi.mock( 'calypso/reader/lib/reader-router', () => ( {
	readerNotFound: vi.fn(),
} ) );

vi.mock( '../controller', () => ( {
	fetchAlphabeticTags: vi.fn(),
	fetchTrendingTags: vi.fn(),
	tagsListing: vi.fn(),
} ) );

describe( 'reader tags routes', () => {
	it( 'registers the tags catch-all through the injected router', () => {
		const router = vi.fn();

		initTags( router );

		expect( router ).toHaveBeenCalledWith(
			'/tags/*',
			redirectLoggedOutToDiscoverTags,
			readerNotFound
		);
		expect( page ).not.toHaveBeenCalled();
	} );
} );
