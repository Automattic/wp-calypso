/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
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

describe( 'Email Step Titan Signup Card', () => {
	test( 'should display price information', () => {
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

		expect( screen.getByText( 'Add' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Loading…' ) ).toBeNull();
	} );
} );
