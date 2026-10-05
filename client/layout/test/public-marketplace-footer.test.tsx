/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { PublicMarketplaceFooter } from '../public-marketplace-footer';

jest.mock( '@automattic/calypso-config', () => ( { isEnabled: () => true } ) );
jest.mock( '../global-footer', () => ( {
	GlobalFooter: ( { isLoggedIn }: { isLoggedIn: boolean } ) => (
		<footer aria-label={ isLoggedIn ? 'Member footer' : 'Visitor footer' } />
	),
} ) );

const publicPage = {
	sectionName: 'themes',
	currentRoute: '/themes',
	isLoggedIn: true,
	hasSidebar: false,
	hasSelectedSite: false,
};

describe( 'PublicMarketplaceFooter', () => {
	it.each( [ 'themes', 'theme', 'plugins' ] )(
		'renders public %s for members and visitors',
		( sectionName ) => {
			const { rerender } = render(
				<PublicMarketplaceFooter { ...publicPage } sectionName={ sectionName } />
			);
			expect( screen.getByRole( 'contentinfo', { name: 'Member footer' } ) ).toBeVisible();
			rerender(
				<PublicMarketplaceFooter
					{ ...publicPage }
					sectionName={ sectionName }
					isLoggedIn={ false }
				/>
			);
			expect( screen.getByRole( 'contentinfo', { name: 'Visitor footer' } ) ).toBeVisible();
		}
	);

	it.each( [ 'themes', 'plugins' ] )(
		'omits the footer from %s with a sidebar',
		( sectionName ) => {
			render(
				<PublicMarketplaceFooter { ...publicPage } sectionName={ sectionName } hasSidebar />
			);
			expect( screen.queryByRole( 'contentinfo' ) ).not.toBeInTheDocument();
		}
	);

	it( 'omits the footer for a selected site even while its sidebar loads', () => {
		render( <PublicMarketplaceFooter { ...publicPage } hasSelectedSite /> );
		expect( screen.queryByRole( 'contentinfo' ) ).not.toBeInTheDocument();
	} );

	it.each( [
		'/plugins/manage',
		'/plugins/scheduled-updates',
		'/plugins/setup',
		'/plugins/upload',
		'/plugins/plans',
		'/plugins/active',
		'/plugins/inactive',
		'/plugins/updates',
		'/themes/upload',
		'/es/plugins/manage',
		'/themes/example.wordpress.com',
		'/themes/1234',
		'/plugins/akismet/example.wordpress.com',
	] )( 'omits the footer from %s without a sidebar', ( currentRoute ) => {
		render( <PublicMarketplaceFooter { ...publicPage } currentRoute={ currentRoute } /> );
		expect( screen.queryByRole( 'contentinfo' ) ).not.toBeInTheDocument();
	} );

	it( 'leaves Patterns to its existing footer wrapper', () => {
		render( <PublicMarketplaceFooter { ...publicPage } sectionName="patterns" /> );
		expect( screen.queryByRole( 'contentinfo' ) ).not.toBeInTheDocument();
	} );
} );
