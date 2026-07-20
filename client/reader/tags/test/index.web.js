/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { readerNotFound } from 'calypso/reader/lib/reader-router';
import initTags from '../index.web';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

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

jest.mock( 'calypso/reader/controller', () => ( {
	sidebar: jest.fn(),
} ) );

jest.mock( 'calypso/reader/lib/reader-router', () => ( {
	readerNotFound: jest.fn(),
} ) );

jest.mock( '../controller', () => ( {
	fetchAlphabeticTags: jest.fn(),
	fetchTrendingTags: jest.fn(),
	tagsListing: jest.fn(),
} ) );

describe( 'reader tags routes', () => {
	it( 'registers the tags catch-all through the injected router', () => {
		const router = jest.fn();

		initTags( router );

		expect( router ).toHaveBeenCalledWith( '/tags/*', readerNotFound );
		expect( page ).not.toHaveBeenCalledWith( '/tags/*', readerNotFound );
	} );
} );
