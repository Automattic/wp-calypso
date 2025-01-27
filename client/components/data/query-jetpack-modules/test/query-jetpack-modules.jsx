/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
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

let isWpcomAtomic = false;
let isJetpack = false;
const siteId = 1;
const mockStore = configureStore( middlewares );

function getStore() {
	return mockStore( {
		currentUser: {
			id: 1,
		},
		sites: {
			items: {
				[ siteId ]: {
					ID: siteId,
					options: {
						is_wpcom_atomic: isWpcomAtomic,
					},
					jetpack: isJetpack,
				},
			},
		},
		jetpack: {
			modules: {
				fetching: false,
			},
		},
	} );
}

describe( 'fetchModuleList', () => {
	test( "Ensure we're NOT calling fetchModuleList for simple sites", async () => {
		isWpcomAtomic = false;
		isJetpack = false;

		render(
			<Provider store={ getStore() }>
				<QueryJetpackModules siteId={ siteId } />
			</Provider>
		);

		expect( mockFetchModuleList ).not.toHaveBeenCalled();
	} );

	test( "Ensure we're calling fetchModuleList for Atomic sites", async () => {
		isWpcomAtomic = true;
		isJetpack = true;

		render(
			<Provider store={ getStore() }>
				<QueryJetpackModules siteId={ siteId } />
			</Provider>
		);

		expect( mockFetchModuleList ).toHaveBeenCalled();
	} );

	test( "Ensure we're calling fetchModuleList for Jetpack Non Atomic sites", async () => {
		isWpcomAtomic = false;
		isJetpack = true;

		render(
			<Provider store={ getStore() }>
				<QueryJetpackModules siteId={ siteId } />
			</Provider>
		);

		expect( mockFetchModuleList ).toHaveBeenCalledTimes( 2 );
	} );
} );
