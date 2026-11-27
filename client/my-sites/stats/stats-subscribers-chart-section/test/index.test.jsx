/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { vi } from 'vitest';
import SubscribersChartSection from '..';

vi.mock( '../../hooks/use-subscribers-query', () => ( {
	default: () => ( {
		isLoading: false,
		isError: false,
		data: undefined,
		status: 'success',
	} ),
} ) );

vi.mock( '../../hooks/use-css-variable', () => ( { default: () => '' } ) );

vi.mock( 'calypso/blocks/stats-navigation/intervals', () => ( { default: () => null } ) );

vi.mock( '../../stats-period-header', () => ( {
	default: ( { children } ) => <div>{ children }</div>,
} ) );

vi.mock( '../subscribers-navigation-arrows', () => ( { default: () => null } ) );

vi.mock( 'calypso/lib/subscribers/get-subscribers-url', () => ( {
	getSubscribersUrl: () => '/subscribers/example.com',
} ) );

const renderSection = ( capabilities ) => {
	const state = {
		currentUser: { capabilities },
		memberships: { productList: { items: { 123: [] } } },
		sites: { items: {} },
	};
	const store = createStore( () => state );

	render(
		<Provider store={ store }>
			<SubscribersChartSection siteId={ 123 } slug="example.com" />
		</Provider>
	);
};

describe( 'Stats subscribers chart heading', () => {
	it( 'links to the Subscribers page when the site grants manage_options', () => {
		renderSection( { 123: { manage_options: true } } );

		expect( screen.getByRole( 'heading', { name: /Subscribers/ } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'View all subscribers' } ) ).toHaveAttribute(
			'href',
			'/subscribers/example.com'
		);
	} );

	it( 'keeps the heading without the link when manage_options is missing', () => {
		renderSection( { 123: { manage_options: false } } );

		expect( screen.getByRole( 'heading', { name: 'Subscribers' } ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'link', { name: 'View all subscribers' } )
		).not.toBeInTheDocument();
	} );

	it( 'hides the link when the site has no capability data', () => {
		renderSection( {} );

		expect(
			screen.queryByRole( 'link', { name: 'View all subscribers' } )
		).not.toBeInTheDocument();
	} );
} );
