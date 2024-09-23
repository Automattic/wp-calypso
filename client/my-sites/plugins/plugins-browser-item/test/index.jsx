/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import PluginsBrowserListElement from '../';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/plugins/installed/selectors' );
jest.mock( 'calypso/state/products-list/selectors' );
jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
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
			plugin: { name: 'wordfence', slug: 'wordfence' },
		};

		render( <PluginsBrowserListElement { ...props } /> );
		const message = screen.queryByText( 'Why is this plugin not compatible with WordPress.com?' );
		expect( message ).toBeInTheDocument();
	} );

	test( 'should render the incompatible plugin message on Atomic Sites', () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => true );

		const props = {
			plugin: { name: 'wordfence', slug: 'wordfence' },
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
} );
