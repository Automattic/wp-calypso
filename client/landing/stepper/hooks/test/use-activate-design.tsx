/**
 * @jest-environment jsdom
 */
import wpcomRequest from '@automattic/data-stores/src/wpcom-request';
import { getAssemblerDesign } from '@automattic/design-picker';
import { act, renderHook } from '@testing-library/react';
import { useDispatch } from 'calypso/state';
import { useActivateDesign } from '../use-activate-design';
import { useSiteData } from '../use-site-data';

jest.mock( '@automattic/data-stores/src/wpcom-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn( () => true ),
} ) );

jest.mock( 'calypso/state', () => ( { useDispatch: jest.fn() } ) );
jest.mock( '../use-site-data', () => ( { useSiteData: jest.fn() } ) );

it( 'rejects activation without site details before making a request', async () => {
	const reduxDispatch = jest.fn();
	jest.mocked( useDispatch ).mockReturnValue( reduxDispatch );
	jest.mocked( useSiteData ).mockReturnValue( {
		site: null,
		siteId: 123,
		siteSlug: 'test.wordpress.com',
		siteSlugOrId: 'test.wordpress.com',
	} );
	const { result } = renderHook( () => useActivateDesign() );

	await act( async () => {
		await expect( result.current( getAssemblerDesign(), {} ) ).rejects.toThrow(
			'Unable to load site details'
		);
	} );

	expect( wpcomRequest ).not.toHaveBeenCalled();
	expect( reduxDispatch ).not.toHaveBeenCalled();
} );
