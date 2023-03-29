/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react-hooks';
import { useDomainParam } from '../use-domain-param';

jest.mock( 'react-router-dom', () => ( {
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup',
		search: '?domain=testingdomain.wordpress.com',
		hash: '',
		state: undefined,
	} ) ),
} ) );

describe( 'use-site-id-param hook', () => {
	test( 'returns domain if provided', async () => {
		const { result } = renderHook( () => useDomainParam() );
		expect( result.current ).toEqual( 'testingdomain.wordpress.com' );
	} );
} );
