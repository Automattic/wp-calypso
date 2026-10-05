/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import hasLoadedSiteFeatures from 'calypso/state/selectors/has-loaded-site-features';
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
jest.mock( 'calypso/state/selectors/has-loaded-site-features' );
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
		const plugin = { name: 'Jetpack VaultPress Backup', slug: 'jetpack-backup' };
		const included = 'Your site plan already includes Jetpack VaultPress Backup.';
		const neutral =
			'WordPress.com plans that support plugins already include Jetpack VaultPress Backup.';
		const withFeatures = ( ...features ) =>
			siteHasFeature.mockImplementation( ( state, siteId, feature ) =>
				features.includes( feature )
			);

		beforeEach( () => {
			isJetpackSite.mockImplementation( () => true );
			isAtomicSite.mockImplementation( () => true );
			hasLoadedSiteFeatures.mockImplementation( () => true );
		} );

		test( 'links to backups when the plan can self-serve backups', () => {
			withFeatures( 'backups', 'backups-self-serve' );
			render( <PluginsBrowserListElement site="example.com" plugin={ plugin } /> );
			expect( screen.getByRole( 'link', { name: included } ) ).toBeInTheDocument();
		} );

		test( 'says backups are included without a link when the plan has daily backups only', () => {
			withFeatures( 'backups' );
			render( <PluginsBrowserListElement site="example.com" plugin={ plugin } /> );
			expect( screen.getByText( included ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'link', { name: included } ) ).not.toBeInTheDocument();
		} );

		test( 'uses the neutral message when the plan has no backups', () => {
			withFeatures();
			render( <PluginsBrowserListElement site="example.com" plugin={ plugin } /> );
			expect( screen.getByText( neutral ) ).toBeInTheDocument();
			expect( screen.queryByText( included ) ).not.toBeInTheDocument();
		} );

		test( 'shows no backup message while the site features are loading', () => {
			hasLoadedSiteFeatures.mockImplementation( () => false );
			withFeatures();
			render( <PluginsBrowserListElement site="example.com" plugin={ plugin } /> );
			expect( screen.queryByText( neutral ) ).not.toBeInTheDocument();
			expect( screen.queryByText( included ) ).not.toBeInTheDocument();
		} );

		test( 'uses the neutral message when no site is selected', () => {
			isJetpackSite.mockImplementation( () => false );
			isAtomicSite.mockImplementation( () => false );
			hasLoadedSiteFeatures.mockImplementation( () => false );
			withFeatures();
			render( <PluginsBrowserListElement plugin={ plugin } /> );
			expect( screen.getByText( neutral ) ).toBeInTheDocument();
			expect(
				screen.queryByText( 'Why is this plugin not compatible with WordPress.com?' )
			).not.toBeInTheDocument();
		} );
	} );
} );
