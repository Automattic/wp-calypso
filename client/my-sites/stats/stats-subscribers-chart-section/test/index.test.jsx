/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import SubscribersChartSection from '..';

jest.mock( '../../hooks/use-subscribers-query', () => () => ( {
	isLoading: false,
	isError: false,
	data: undefined,
	status: 'success',
} ) );

jest.mock( '../../hooks/use-css-variable', () => () => '' );

jest.mock( 'calypso/blocks/stats-navigation/intervals', () => () => null );

jest.mock( '../../stats-period-header', () => ( { children } ) => <div>{ children }</div> );

jest.mock( '../subscribers-navigation-arrows', () => () => null );

jest.mock( 'calypso/lib/subscribers/get-subscribers-url', () => ( {
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
