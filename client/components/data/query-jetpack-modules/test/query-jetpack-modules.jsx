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

let isWpcomAtomic = false;
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
		render(
			<Provider store={ getStore() }>
				<QueryJetpackModules siteId={ siteId } />
			</Provider>
		);

		expect( mockFetchModuleList ).not.toHaveBeenCalled();
	} );

	test( "Ensure we're calling fetchModuleList only for atomic sites", async () => {
		isWpcomAtomic = true;

		render(
			<Provider store={ getStore() }>
				<QueryJetpackModules siteId={ siteId } />
			</Provider>
		);

		expect( mockFetchModuleList ).toHaveBeenCalled();
	} );
} );
