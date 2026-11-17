/** @jest-environment jsdom */
import page from '@automattic/calypso-router';
import { renderHook } from '@testing-library/react';
import { useSelector } from 'calypso/state';
import useBusinessTrialIncludedFeatures from '../use-business-trial-included-features';

jest.mock( '@automattic/calypso-router', () => jest.fn() );
jest.mock( '@automattic/i18n-utils', () => ( { useHasEnTranslation: () => () => true } ) );
jest.mock( 'i18n-calypso', () => ( { useTranslate: () => ( value: string ) => value } ) );
jest.mock( 'calypso/state', () => ( { useSelector: jest.fn() } ) );
jest.mock( 'calypso/state/sites/selectors', () => ( { getSiteId: () => 123 } ) );

const originalLocation = window.location;
beforeAll( () => Object.defineProperty( window, 'location', { value: { href: '' } } ) );
afterAll( () => Object.defineProperty( window, 'location', { value: originalLocation } ) );
afterEach( () => {
	jest.clearAllMocks();
	window.location.href = '';
} );

test.each( [
	[ 'new dashboard', [ { children: [ { slug: 'jetpack-seo' } ] } ], true ],
	[ 'legacy dashboard', [ { children: [ { slug: 'jetpack' } ] } ], false ],
	[ 'menu not loaded', null, false ],
] )( 'routes the SEO card for %s', ( _label, menu, native ) => {
	jest
		.mocked( useSelector )
		.mockImplementation( ( selector ) => selector( { adminMenu: { menus: { 123: menu } } } ) );
	const { result } = renderHook( () =>
		useBusinessTrialIncludedFeatures( 'example.com', 'https://example.com/wp-admin/' )
	);
	result.current.find( ( feature ) => feature.id === 'seo-tools' )?.buttonClick?.();
	expect( window.location.href ).toBe(
		native ? 'https://example.com/wp-admin/admin.php?page=jetpack-seo' : ''
	);
	expect( jest.mocked( page ).mock.calls ).toEqual(
		native ? [] : [ [ '/marketing/traffic/example.com' ] ]
	);
} );
