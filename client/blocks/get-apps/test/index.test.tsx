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

	it( 'shows Mobile section before Desktop for single-site users', () => {
		( getCurrentUserSiteCount as jest.Mock ).mockReturnValue( 1 );

		renderWithProvider( <GetApps /> );

		const headings = screen.getAllByRole( 'heading', { level: 2 } );
		const headingTexts = headings.map( ( h ) => h.textContent );

		expect( headingTexts.indexOf( 'Mobile' ) ).toBeLessThan(
			headingTexts.indexOf( 'Desktop' )
		);
	} );

	it( 'shows Desktop section before Mobile for multi-site users', () => {
		( getCurrentUserSiteCount as jest.Mock ).mockReturnValue( 2 );

		renderWithProvider( <GetApps /> );

		const headings = screen.getAllByRole( 'heading', { level: 2 } );
		const headingTexts = headings.map( ( h ) => h.textContent );

		expect( headingTexts.indexOf( 'Desktop' ) ).toBeLessThan(
			headingTexts.indexOf( 'Mobile' )
		);
	} );

	it( 'shows WordPress.com desktop app before Studio for single-site users', () => {
		( getCurrentUserSiteCount as jest.Mock ).mockReturnValue( 1 );

		renderWithProvider( <GetApps /> );

		const desktopApp = screen.getByTestId( 'desktop-app-wordpress' );
		const studio = screen.getByTestId( 'desktop-app-wordpress-studio' );

		expect(
			desktopApp.compareDocumentPosition( studio ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	it( 'shows Studio before WordPress.com desktop app for multi-site users', () => {
		( getCurrentUserSiteCount as jest.Mock ).mockReturnValue( 2 );

		renderWithProvider( <GetApps /> );

		const studio = screen.getByTestId( 'desktop-app-wordpress-studio' );
		const desktopApp = screen.getByTestId( 'desktop-app-wordpress' );

		expect(
			studio.compareDocumentPosition( desktopApp ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	it( 'treats null site count as single-site user', () => {
		( getCurrentUserSiteCount as jest.Mock ).mockReturnValue( null );

		renderWithProvider( <GetApps /> );

		const headings = screen.getAllByRole( 'heading', { level: 2 } );
		const headingTexts = headings.map( ( h ) => h.textContent );

		expect( headingTexts.indexOf( 'Mobile' ) ).toBeLessThan(
			headingTexts.indexOf( 'Desktop' )
		);
	} );
} );
