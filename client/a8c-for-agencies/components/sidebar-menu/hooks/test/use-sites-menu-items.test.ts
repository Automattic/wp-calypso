/**
 * @vitest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import useNoActiveSite from 'calypso/a8c-for-agencies/hooks/use-no-active-site';
import useSitesMenuItems from '../use-sites-menu-items';

vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useTranslate: () => ( str: string ) => str,
	} )
);

vi.mock( 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites' );
vi.mock( 'calypso/a8c-for-agencies/hooks/use-no-active-site' );
vi.mock( 'calypso/my-sites/sidebar/utils', () => ( {
	itemLinkMatches: ( link: string, path: string ) => link === path,
} ) );

const mockUseFetchPendingSites = useFetchPendingSites as Mock;
const mockUseNoActiveSite = useNoActiveSite as Mock;

const pendingSite = {
	features: {
		wpcom_atomic: { state: 'pending', license_key: 'abc123' },
	},
};

describe( 'useSitesMenuItems', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	it( 'shows "Needs setup" when the agency has no created sites but has a pending licence', () => {
		mockUseNoActiveSite.mockReturnValue( true );
		mockUseFetchPendingSites.mockReturnValue( { data: [ pendingSite ] } );

		const { result } = renderHook( () => useSitesMenuItems( '/sites' ) );
		const ids = result.current.map( ( item ) => item.id );

		expect( ids ).toContain( 'sites-needs-setup-menu-item' );
		expect( ids ).not.toContain( 'sites-needs-attention-menu-item' );
		expect( ids ).not.toContain( 'sites-development-menu-item' );
		expect( ids ).not.toContain( 'sites-favorites-menu-item' );
	} );

	it( 'does not show "Needs setup" when the agency has no created sites and no pending licences', () => {
		mockUseNoActiveSite.mockReturnValue( true );
		mockUseFetchPendingSites.mockReturnValue( { data: [] } );

		const { result } = renderHook( () => useSitesMenuItems( '/sites' ) );
		const ids = result.current.map( ( item ) => item.id );

		expect( ids ).toEqual( [ 'sites-all-menu-item' ] );
	} );

	it( 'shows all items when the agency has active sites and a pending licence', () => {
		mockUseNoActiveSite.mockReturnValue( false );
		mockUseFetchPendingSites.mockReturnValue( { data: [ pendingSite ] } );

		const { result } = renderHook( () => useSitesMenuItems( '/sites' ) );
		const ids = result.current.map( ( item ) => item.id );

		expect( ids ).toContain( 'sites-needs-setup-menu-item' );
		expect( ids ).toContain( 'sites-needs-attention-menu-item' );
		expect( ids ).toContain( 'sites-development-menu-item' );
		expect( ids ).toContain( 'sites-favorites-menu-item' );
	} );

	it( 'shows all items except "Needs setup" when the agency has active sites and no pending licences', () => {
		mockUseNoActiveSite.mockReturnValue( false );
		mockUseFetchPendingSites.mockReturnValue( { data: [] } );

		const { result } = renderHook( () => useSitesMenuItems( '/sites' ) );
		const ids = result.current.map( ( item ) => item.id );

		expect( ids ).not.toContain( 'sites-needs-setup-menu-item' );
		expect( ids ).toContain( 'sites-needs-attention-menu-item' );
		expect( ids ).toContain( 'sites-development-menu-item' );
		expect( ids ).toContain( 'sites-favorites-menu-item' );
	} );
} );
