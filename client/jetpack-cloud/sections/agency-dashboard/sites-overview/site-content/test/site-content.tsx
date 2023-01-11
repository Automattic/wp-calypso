/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SiteContent from '../index';

jest.mock( '@automattic/viewport-react', () => ( {
	useDesktopBreakpoint: () => true,
	useMobileBreakpoint: () => false,
} ) );

describe( '<SiteContent>', () => {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/jetpack-blogs/1234/test-connection?is_stale_connection_healthy=true' )
		.reply( 200, {
			connected: true,
		} );
	const sites = [
		{
			blog_id: 1234,
			url: 'test.jurassic.ninja',
			monitor_settings: {
				monitor_active: true,
			},
		},
	];
	let props = {
		data: { sites, total: 1, perPage: 10 },
		isLoading: false,
		currentPage: 1,
	};
	const initialState = {
		partnerPortal: {
			partner: {
				isPartnerOAuthTokenLoaded: true,
			},
		},
	};
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
