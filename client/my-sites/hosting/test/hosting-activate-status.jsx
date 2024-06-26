/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { transferStates } from '../../../state/automated-transfer/constants';
import HostingActivateStatus from '../hosting-activate-status';

const mockTransferStatus = transferStates.NONE;
const mockInitialState = {
	sites: {
		items: [],
		requesting: {},
		plans: {},
	},
	ui: {
		selectedSiteId: 1,
	},
	currentUser: {
		id: 12,
		user: {
			email_verified: true,
		},
	},
	notices: {
		items: [],
	},
	automatedTransfer: {
		[ 1 ]: {
			status: mockTransferStatus,
		},
	},
};

describe( 'index', () => {
	test( 'Transfer status COMPLETED should return isTransferCompleted true', async () => {
		mockInitialState.automatedTransfer[ 1 ].status = transferStates.COMPLETED;
		const mockStore = configureStore();
		const store = mockStore( mockInitialState );

		const onTick = jest.fn();

		render(
			<Provider store={ store }>
				<HostingActivateStatus onTick={ onTick } context="hosting" />
			</Provider>
		);

		expect( onTick ).toHaveBeenCalledWith( false, false, true );
	} );

	test( 'Transfer status NONE should return isTransferCompleted true', async () => {
		mockInitialState.automatedTransfer[ 1 ].status = transferStates.NONE;
		const mockStore = configureStore();
		const store = mockStore( mockInitialState );

		const onTick = jest.fn();

		render(
			<Provider store={ store }>
				<HostingActivateStatus onTick={ onTick } context="hosting" />
			</Provider>
		);

		expect( onTick ).toHaveBeenCalledWith( false, false, true );
	} );

	test( 'Should show the transferring notice when the site is transferring to Atomic based on context', async () => {
		mockInitialState.automatedTransfer[ 1 ].status = transferStates.PENDING;
		const mockStore = configureStore();
		const store = mockStore( mockInitialState );

		render(
			<Provider store={ store }>
				<HostingActivateStatus context="hosting" />
			</Provider>
		);

		expect(
			screen.getByText( 'Please wait while we activate the hosting features.' )
		).toBeInTheDocument();

		render(
			<Provider store={ store }>
				<HostingActivateStatus context="plugin" />
			</Provider>
		);
		expect(
			screen.getByText( 'Please wait while we activate the plugin features.' )
		).toBeInTheDocument();

		render(
			<Provider store={ store }>
				<HostingActivateStatus context="theme" />
			</Provider>
		);
		expect(
			screen.getByText( 'Please wait while we activate the theme features.' )
		).toBeInTheDocument();
	} );

	test( 'Should show error status and the transfer fails', async () => {
		const mockStore = configureStore();
		mockInitialState.automatedTransfer[ 1 ].status = transferStates.ERROR;
		const store = mockStore( mockInitialState );

		render(
			<Provider store={ store }>
				<HostingActivateStatus context="hosting" />
			</Provider>
		);

		expect(
			screen.queryByText( 'Please wait while we activate the hosting features.' )
		).not.toBeInTheDocument();

		expect(
			screen.queryByText( 'There was an error activating hosting features.' )
		).toBeInTheDocument();

		render(
			<Provider store={ store }>
				<HostingActivateStatus context="plugin" />
			</Provider>
		);
		expect(
			screen.getByText( 'There was an error activating plugin features.' )
		).toBeInTheDocument();

		render(
			<Provider store={ store }>
				<HostingActivateStatus context="theme" />
			</Provider>
		);
		expect(
			screen.getByText( 'There was an error activating theme features.' )
		).toBeInTheDocument();
	} );
} );
