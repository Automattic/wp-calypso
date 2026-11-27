/**
 * @vitest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { vi } from 'vitest';
import { redirectLoggedOutToDiscoverTags } from 'calypso/reader/controller';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import initTagStream from '../index';

vi.mock( '@automattic/calypso-router', () => {
	const pageMock = vi.fn();
	pageMock.redirect = vi.fn();
	return {
		__esModule: true,
		default: pageMock,
	};
} );

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
	tagListing: vi.fn(),
} ) );

describe( 'reader tag stream routes', () => {
	beforeEach( () => {
		page.mockClear();
	} );

	it( 'registers the tag catch-all', () => {
		initTagStream();

		expect( page ).toHaveBeenCalledWith(
			'/tag/*',
			redirectLoggedOutToDiscoverTags,
			readerNotFound
		);
	} );
} );
