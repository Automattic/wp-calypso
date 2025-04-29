/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import * as queryProductsList from 'calypso/components/data/query-products-list';
import EmailStep from '../index';

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

const productListQuerySpy = jest.spyOn( queryProductsList, 'default' );

describe( 'Email Step', () => {
	test( 'should request a complete product list', () => {
		const middlewares = [ thunk ];
		const mockStore = configureStore( middlewares );
		const store = mockStore( initialState );

		render(
			<Provider store={ store }>
				<EmailStep flowName="test:flow" stepName="test:step2" />
			</Provider>
		);

		// An empty first argument means we're fetching all products, so we'll
		// have access to email product data. The second empty prop represents
		// the React children (we have none).
		expect( productListQuerySpy ).toHaveBeenCalledWith( {}, {} );
	} );
} );
