/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { A4A_REPORTS_LINK } from 'calypso/a8c-for-agencies/sections/reports/constants';
import { useSelector } from 'calypso/state';
import useSitesMenuItems from '../use-sites-menu-items';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites', () => ( {
	__esModule: true,
	default: () => ( { data: undefined } ),
} ) );

jest.mock( 'calypso/a8c-for-agencies/hooks/use-no-active-site', () => ( {
	__esModule: true,
	default: () => true,
} ) );

const mockUseSelector = useSelector as jest.MockedFunction< typeof useSelector >;

const reportsItem = ( path = '/sites' ) =>
	renderHook( () => useSitesMenuItems( path ) ).result.current.find(
		( item ) => item.link === A4A_REPORTS_LINK
	);

describe( 'useSitesMenuItems', () => {
	it( 'includes Reports when the user can read reports', () => {
		mockUseSelector.mockReturnValue( { user: { capabilities: [ 'a4a_read_reports' ] } } );

		expect( reportsItem() ).toMatchObject( { title: 'Reports', badge: 'Beta', withChevron: true } );
	} );

	it( 'omits Reports when the user lacks the reports capability', () => {
		mockUseSelector.mockReturnValue( { user: { capabilities: [ 'a4a_read_managed_sites' ] } } );

		expect( reportsItem() ).toBeUndefined();
	} );

	it( 'does not select Reports while a Sites view is active', () => {
		mockUseSelector.mockReturnValue( { user: { capabilities: [ 'a4a_read_reports' ] } } );

		expect( reportsItem( '/sites' )?.isSelected ).toBe( false );
		expect( reportsItem( A4A_REPORTS_LINK )?.isSelected ).toBe( true );
	} );
} );
