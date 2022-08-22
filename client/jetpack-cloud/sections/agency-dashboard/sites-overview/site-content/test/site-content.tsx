/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SiteContent from '../index';

describe( '<SiteContent>', () => {
	const sites = [
		{
			blog_id: 1234,
			url: 'test.jurassic.ninja',
		},
	];
	let props = {
		data: { sites, total: 1, perPage: 10 },
		isLoading: false,
		currentPage: 1,
	};
	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	const Wrapper = ( { props } ) => (
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<SiteContent { ...props } />
			</QueryClientProvider>
		</Provider>
	);

	test( 'should render correctly and show table', () => {
		const { container } = render( <Wrapper props={ props } /> );
		const [ tableContent ] = container.getElementsByClassName( 'site-table__table' );
		expect( tableContent ).toBeInTheDocument();
	} );
	test( 'should render correctly and show loading indicator', () => {
		props = {
			...props,
			isLoading: true,
		};
		const { container } = render( <Wrapper props={ props } /> );
		const [ loadinContent ] = container.getElementsByClassName( 'partner-portal-text-placeholder' );
		expect( loadinContent ).toBeInTheDocument();
	} );
} );
