/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import GetApps from '../index';

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserSiteCount: jest.fn(),
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const mock = ( key: string ) => {
		if ( key === 'env_id' ) {
			return 'production';
		}
		return null;
	};
	mock.isEnabled = jest.fn( () => false );
	return { __esModule: true, default: mock };
} );

jest.mock( 'calypso/components/navigation-header', () => ( {
	__esModule: true,
	default: ( { title }: { title: string } ) => <h1>{ title }</h1>,
} ) );

jest.mock( '../desktop-download-card', () => ( {
	__esModule: true,
	default: ( { appConfig }: { appConfig: { id: string; title: string } } ) => (
		<div data-testid={ `desktop-app-${ appConfig.id }` }>{ appConfig.title }</div>
	),
} ) );

jest.mock( '../mobile-download-card', () => ( {
	__esModule: true,
	default: () => <div data-testid="mobile-download-card">Jetpack mobile app</div>,
} ) );

describe( 'GetApps', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'shows Jetpack mobile first for single-site users', () => {
		( getCurrentUserSiteCount as jest.Mock ).mockReturnValue( 1 );

		renderWithProvider( <GetApps /> );

		const mobile = screen.getByTestId( 'mobile-download-card' );
		const studio = screen.getByTestId( 'desktop-app-wordpress-studio' );
		const desktop = screen.getByTestId( 'desktop-app-wordpress' );

		expect(
			mobile.compareDocumentPosition( studio ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			studio.compareDocumentPosition( desktop ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	it( 'shows Studio first for multi-site users', () => {
		( getCurrentUserSiteCount as jest.Mock ).mockReturnValue( 2 );

		renderWithProvider( <GetApps /> );

		const studio = screen.getByTestId( 'desktop-app-wordpress-studio' );
		const mobile = screen.getByTestId( 'mobile-download-card' );
		const desktop = screen.getByTestId( 'desktop-app-wordpress' );

		expect(
			studio.compareDocumentPosition( mobile ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			mobile.compareDocumentPosition( desktop ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	it( 'always shows WordPress.com desktop app last', () => {
		( getCurrentUserSiteCount as jest.Mock ).mockReturnValue( 5 );

		renderWithProvider( <GetApps /> );

		const desktop = screen.getByTestId( 'desktop-app-wordpress' );
		const allTestIds = screen.getAllByTestId( /desktop-app-|mobile-download/ );

		expect( allTestIds[ allTestIds.length - 1 ] ).toBe( desktop );
	} );

	it( 'treats null site count as single-site user', () => {
		( getCurrentUserSiteCount as jest.Mock ).mockReturnValue( null );

		renderWithProvider( <GetApps /> );

		const mobile = screen.getByTestId( 'mobile-download-card' );
		const studio = screen.getByTestId( 'desktop-app-wordpress-studio' );

		expect(
			mobile.compareDocumentPosition( studio ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );
} );
