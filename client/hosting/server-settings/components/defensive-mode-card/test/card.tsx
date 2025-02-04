/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
	useEdgeCacheDefensiveModeQuery,
	useEdgeCacheDefensiveModeMutation,
} from 'calypso/data/hosting/use-cache';
import DefensiveModeCard from 'calypso/sites/settings/web-server/defensive-mode-form';

const INITIAL_STATE = {
	sites: {
		items: {},
	},
	siteSettings: { items: {} },
	ui: {
		selectedSiteId: 1,
	},
	options: {
		onError: () => {},
	},
};
const mockStore = configureStore();
const store = mockStore( INITIAL_STATE );

jest.mock( 'calypso/components/inline-support-link', () => {
	return () => {
		<>InlineSupportLink</>;
	};
} );

jest.mock( 'react-redux', () => ( {
	__esModule: true,
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn(),
} ) );

jest.mock( 'calypso/data/hosting/use-cache' );
jest.mock( 'calypso/state/hosting/actions' );

describe( 'DefensiveModeCard component', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( useDispatch ).mockReturnValue( jest.fn() );
		jest.mocked( useEdgeCacheDefensiveModeQuery ).mockReturnValue( {
			data: { enabled: false, enabled_until: 0 },
			isLoading: false,
		} );
		jest.mocked( useEdgeCacheDefensiveModeMutation ).mockReturnValue( {
			mutate: jest.fn(),
			isPending: false,
		} );
	} );

	function renderWithProvider() {
		render(
			<Provider store={ store }>
				<DefensiveModeCard disabled={ false } />
			</Provider>
		);
	}

	it( 'does not display controls when defensive mode is disabled', () => {
		jest
			.mocked( useEdgeCacheDefensiveModeQuery )
			.mockReturnValue( { data: null, isLoading: true } );

		renderWithProvider();

		expect( screen.queryByText( 'Disable defensive mode' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Enable defensive mode' ) ).not.toBeInTheDocument();
	} );

	it( 'displays enable button when defensive mode is disabled', () => {
		renderWithProvider();

		expect( screen.queryByText( 'Enable defensive mode' ) ).toBeInTheDocument();
	} );

	it( 'calls mutation when clicking enable button', async () => {
		const mutateFnMock = jest.fn();
		jest.mocked( useEdgeCacheDefensiveModeMutation ).mockReturnValue( {
			mutate: mutateFnMock,
			isPending: false,
		} );

		renderWithProvider();

		await userEvent.selectOptions(
			screen.getByLabelText( 'Duration' ),
			screen.getByText( '12 hours' )
		);
		await userEvent.click( screen.getByText( 'Enable defensive mode' ) );

		expect( mutateFnMock ).toHaveBeenCalledWith( { active: true, ttl: 43200 } );
	} );

	it( 'calls mutation when clicking disable button', async () => {
		jest.mocked( useEdgeCacheDefensiveModeQuery ).mockReturnValue( {
			data: { enabled: true, enabled_until: 1726494798 },
			isLoading: false,
		} );

		const mutateFnMock = jest.fn();
		jest.mocked( useEdgeCacheDefensiveModeMutation ).mockReturnValue( {
			mutate: mutateFnMock,
			isPending: false,
		} );

		renderWithProvider();

		await userEvent.click( screen.getByText( 'Disable defensive mode' ) );

		expect( mutateFnMock ).toHaveBeenCalledWith( { active: false } );
	} );
} );
