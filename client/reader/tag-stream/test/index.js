/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import initTagStream from '../index';

jest.mock( '@automattic/calypso-router', () => {
	const pageMock = jest.fn();
	pageMock.redirect = jest.fn();
	return {
		__esModule: true,
		default: pageMock,
	};
} );

jest.mock( '@automattic/i18n-utils', () => ( {
	getAnyLanguageRouteParam: () => ':lang([a-z]{2,3}|[a-z]{2}-[a-z]{2})',
	getLanguageRouteParam: () => ':lang(en|fr)?',
} ) );

jest.mock( 'calypso/controller', () => ( {
	makeLayout: jest.fn(),
	redirectInvalidLanguage: jest.fn(),
	redirectWithoutLocaleParamInFrontIfLoggedIn: jest.fn(),
	render: jest.fn(),
} ) );

jest.mock( 'calypso/controller/shared', () => ( {
	setLocaleMiddleware: jest.fn( () => jest.fn() ),
} ) );

jest.mock( 'calypso/lib/reader/is-reader-tag-embed-page', () => jest.fn( () => false ) );

jest.mock( 'calypso/reader/controller', () => ( {
	sidebar: jest.fn(),
} ) );

jest.mock( 'calypso/reader/lib/reader-router', () => ( {
	readerNotFound: jest.fn(),
} ) );

jest.mock( '../controller', () => ( {
	tagListing: jest.fn(),
} ) );

describe( 'reader tag stream routes', () => {
	beforeEach( () => {
		page.mockClear();
	} );

	it( 'registers the tag catch-all', () => {
		initTagStream();

		expect( page ).toHaveBeenCalledWith( '/tag/*', readerNotFound );
	} );
} );
