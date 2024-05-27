/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
const middlewares = [ thunk ];

const mockFetchModuleList = jest.fn( () => {
	return {
		type: 'JETPACK_MODULES_REQUEST',
		siteId: 1,
	};
} );

jest.mock( 'calypso/state/jetpack/modules/actions', () => ( {
	fetchModuleList: () => mockFetchModuleList(),
} ) );

describe( 'fetchModuleList', () => {
	test( "Ensure we're NOT calling fetchModuleList for simple sites", async () => {
		const mockStore = configureStore( middlewares );
		const siteId = 1;
		const store = mockStore( {
			currentUser: {
				id: 1,
				user: {
					had_hosting_trial: false,
				},
			},
			sites: {
				items: {
					[ siteId ]: {
						ID: siteId,
						options: {
							is_wpcom_atomic: false,
						},
					},
				},
			},
			jetpack: {
				modules: {
					fetching: false,
				},
			},
		} );

		render(
			<Provider store={ store }>
				<QueryJetpackModules siteId={ siteId } />
			</Provider>
		);

		expect( mockFetchModuleList ).not.toHaveBeenCalled();
	} );

	test( "Ensure we're calling fetchModuleList only for atomic sites", async () => {
		const mockStore = configureStore( middlewares );
		const siteId = 1;
		const store = mockStore( {
			currentUser: {
				id: 1,
				user: {
					had_hosting_trial: false,
				},
			},
			sites: {
				items: {
					[ siteId ]: {
						ID: siteId,
						options: {
							is_wpcom_atomic: true,
						},
					},
				},
			},
			jetpack: {
				modules: {
					fetching: false,
				},
			},
		} );

		render(
			<Provider store={ store }>
				<QueryJetpackModules siteId={ siteId } />
			</Provider>
		);

		expect( mockFetchModuleList ).toHaveBeenCalled();
	} );
} );
