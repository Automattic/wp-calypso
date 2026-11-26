/**
 * @vitest-environment jsdom
 */
import wpcomRequest from '@automattic/data-stores/src/wpcom-request';
import { getAssemblerDesign } from '@automattic/design-picker';
import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useDispatch } from 'calypso/state';
import { useActivateDesign } from '../use-activate-design';
import { useSiteData } from '../use-site-data';

vi.mock( '@automattic/data-stores/src/wpcom-request', () => ( {
	__esModule: true,
	default: vi.fn(),
	canAccessWpcomApis: vi.fn( () => true ),
} ) );

vi.mock( 'calypso/state', () => ( { useDispatch: vi.fn() } ) );
vi.mock( '../use-site-data', () => ( { useSiteData: vi.fn() } ) );

it( 'rejects activation without site details before making a request', async () => {
	const reduxDispatch = vi.fn();
	vi.mocked( useDispatch ).mockReturnValue( reduxDispatch );
	vi.mocked( useSiteData ).mockReturnValue( {
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
