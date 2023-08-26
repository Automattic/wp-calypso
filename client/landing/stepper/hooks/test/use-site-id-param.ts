/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useSiteIdParam } from '../use-site-id-param';

jest.mock( 'react-router-dom', () => ( {
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup',
		search: '?siteId=2053432885',
		hash: '',
		state: undefined,
	} ) ),
} ) );

describe( 'use-site-id-param hook', () => {
	test( 'returns site id if provided', async () => {
		const { result } = renderHook( () => useSiteIdParam() );
		expect( result.current ).toEqual( '2053432885' );
	} );
} );
