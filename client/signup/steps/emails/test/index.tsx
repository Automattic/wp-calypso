/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as useQueryProductsList from 'calypso/components/data/query-products-list';
import EmailSignupTitanCard from '../index.jsx';

const initialState = {
	flowName: 'test:flow',
	stepName: 'test:step2',
	sites: {
		items: {
			1: {},
		},
	},
	ui: {},
	productsList: {
		isFetching: false,
	},
};

const productListQuerySpy = jest.spyOn( useQueryProductsList, 'default' );

describe( 'Email Step Titan Signup Card', () => {
	test( 'should request a complete product list', () => {
		const newInitialState = {
			...initialState,
			sites: {
				...initialState.sites,
				items: {
					1: {
						...initialState.sites.items[ 1 ],
					},
				},
			},
		};
		const middlewares = [ thunk ];
		const mockStore = configureStore( middlewares );
		const store = mockStore( newInitialState );

		render(
			<Provider store={ store }>
				<EmailSignupTitanCard { ...newInitialState } />
			</Provider>
		);

		expect( productListQuerySpy ).toHaveBeenCalled();
		// An empty first argument means we're fetching all products, so we'll
		// have access to email product data.
		expect( productListQuerySpy.mock.calls[ 0 ][ 0 ] ).toStrictEqual( {} );
	} );
} );
