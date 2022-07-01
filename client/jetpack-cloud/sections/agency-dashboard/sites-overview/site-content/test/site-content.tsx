/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
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
		isError: false,
		isLoading: false,
		currentPage: 1,
	};
	const initialState = {};
	const mockStore = configureStore();
	const store = mockStore( initialState );
	const queryClient = new QueryClient();

	test( 'should render correctly and show table', () => {
		const { container } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<SiteContent { ...props } />
				</QueryClientProvider>
			</Provider>
		);
		const [ tableContent ] = container.getElementsByClassName( 'site-table__table' );
		expect( tableContent ).toBeInTheDocument();
	} );
	test( 'should render correctly and no sites', () => {
		props = {
			...props,
			data: {
				...props.data,
				sites: [],
			},
		};
		const { getByText } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<SiteContent { ...props } />
				</QueryClientProvider>
			</Provider>
		);
		expect( getByText( 'No active sites' ) ).toBeInTheDocument();
	} );
	test( 'should render correctly and show loading indicator', () => {
		props = {
			...props,
			isLoading: true,
		};
		const { container } = render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<SiteContent { ...props } />
				</QueryClientProvider>
			</Provider>
		);
		const [ loadinContent ] = container.getElementsByClassName( 'partner-portal-text-placeholder' );
		expect( loadinContent ).toBeInTheDocument();
	} );
} );
