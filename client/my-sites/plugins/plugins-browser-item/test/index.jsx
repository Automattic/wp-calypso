/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import PluginsBrowserListElement from '../';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/plugins/installed/selectors' );
jest.mock( 'calypso/state/products-list/selectors' );
jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector( {} ) ),
} ) );
jest.mock( 'calypso/my-sites/plugins/use-preinstalled-premium-plugin', () =>
	jest.fn( () => ( { usePreinstalledPremiumPlugin: jest.fn() } ) )
);
jest.mock( 'calypso/state/plugins/last-visited/selectors', () => ( {
	isLastVisitedPlugin: () => {},
} ) );

describe( 'PluginsBrowserItem Incompatible Plugins Message', () => {
	test( 'should render the incompatible plugin message on Simple Sites', () => {
		isJetpackSite.mockImplementation( () => false );
		isAtomicSite.mockImplementation( () => false );

		const props = {
			plugin: { name: 'really-simple-ssl', slug: 'really-simple-ssl' },
		};

		render( <PluginsBrowserListElement { ...props } /> );
		const message = screen.queryByText( 'Why is this plugin not compatible with WordPress.com?' );
		expect( message ).toBeInTheDocument();
	} );

	test( 'should render the incompatible plugin message on Atomic Sites', () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => true );

		const props = {
			plugin: { name: 'really-simple-ssl', slug: 'really-simple-ssl' },
		};

		render( <PluginsBrowserListElement { ...props } /> );
		const message = screen.queryByText( 'Why is this plugin not compatible with WordPress.com?' );
		expect( message ).toBeInTheDocument();
	} );

	test( 'should NOT render the incompatible plugin message on JetpackSite non Atomic sites', () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		const props = {
			plugin: { name: 'wordfence', slug: 'wordfence' },
		};

		render( <PluginsBrowserListElement { ...props } /> );
		const message = screen.queryByText( 'Why is this plugin not compatible with WordPress.com?' );
		expect( message ).not.toBeInTheDocument();
	} );

	test( 'should NOT render the incompatible plugin message if it is not in the list', () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		const props = {
			plugin: { name: 'woocommerce', slug: 'woocommerce' },
		};

		render( <PluginsBrowserListElement { ...props } /> );
		const message = screen.queryByText( 'Why is this plugin not compatible with WordPress.com?' );
		expect( message ).not.toBeInTheDocument();
	} );

	describe( 'Jetpack VaultPress Backup', () => {
		const props = {
			site: 'example.wordpress.com',
			plugin: { name: 'Jetpack VaultPress Backup', slug: 'jetpack-backup' },
		};

		beforeEach( () => {
			isJetpackSite.mockImplementation( () => true );
			isAtomicSite.mockImplementation( () => true );
		} );

		test( 'should say the plan includes backups when the site has real-time backups', () => {
			siteHasFeature.mockImplementation(
				( state, siteId, feature ) => feature === 'real-time-backups'
			);

			render( <PluginsBrowserListElement { ...props } /> );
			expect(
				screen.getByText( 'Your site plan already includes Jetpack VaultPress Backup.' )
			).toBeInTheDocument();
			expect(
				screen.queryByText( 'Why is this plugin not compatible with WordPress.com?' )
			).not.toBeInTheDocument();
		} );

		// Personal and Premium can install plugins but don't include backups.
		test( 'should not claim the plan includes backups when the site lacks them', () => {
			siteHasFeature.mockImplementation( () => false );

			render( <PluginsBrowserListElement { ...props } /> );
			expect(
				screen.getByText( 'Jetpack VaultPress Backup is built into eligible WordPress.com plans.' )
			).toBeInTheDocument();
			expect(
				screen.queryByText( 'Your site plan already includes Jetpack VaultPress Backup.' )
			).not.toBeInTheDocument();
		} );
	} );
} );
