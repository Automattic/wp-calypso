/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { UPDATE_PLUGIN, ACTIVATE_PLUGIN } from 'calypso/lib/plugins/constants';
import UpdatePlugin from '../update-plugin';
import { site, plugin } from './utils/constants';

const initialState = {
	sites: { items: { [ site.ID ]: site } },
	currentUser: {
		capabilities: {},
	},
	plugins: {
		installed: {
			isRequesting: {},
			isRequestingAll: false,
			plugins: {
				[ `${ site.ID }` ]: [ plugin ],
			},
			status: {
				[ `${ site.ID }` ]: {
					[ plugin.id ]: {
						status: 'completed',
						action: ACTIVATE_PLUGIN,
					},
				},
			},
		},
	},
};

const props = {
	plugin,
	selectedSite: site,
	className: 'update-plugin',
	updatePlugin: jest.fn(),
};

describe( '<UpdatePlugin>', () => {
	const mockStore = configureStore();
	const store = mockStore( initialState );

	test( 'should show current and new versions', async () => {
		const { container } = render(
			<Provider store={ store }>
				<UpdatePlugin { ...props } />
			</Provider>
		);

		expect(
			container.getElementsByClassName( 'update-plugin__current-version' )[ 0 ].textContent
		).toEqual( plugin.version );

		const [ updateButton ] = container.getElementsByClassName( 'update-plugin__new-version' );
		expect( updateButton.textContent ).toEqual( `Update to ${ plugin.update.new_version }` );
	} );

	test( 'should show confirmation dialog and update correctly', async () => {
		const { container } = render(
			<Provider store={ store }>
				<UpdatePlugin { ...props } />
			</Provider>
		);

		const [ updateButton ] = container.getElementsByClassName( 'update-plugin__new-version' );
		await userEvent.click( updateButton );

		const [ confirmButton ] = document.querySelectorAll( '.confirm-modal__buttons .is-primary' );
		await userEvent.click( confirmButton );

		expect( props.updatePlugin ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should render correctly and show progress status for plugin update', () => {
		const updatedInitialState = {
			...initialState,
		};
		updatedInitialState.plugins.installed.status = {
			[ `${ site.ID }` ]: {
				[ plugin.id ]: { status: 'inProgress', action: UPDATE_PLUGIN },
			},
		};
		const store = mockStore( updatedInitialState );
		const { container } = render(
			<Provider store={ store }>
				<UpdatePlugin { ...props } />
			</Provider>
		);

		expect(
			container.getElementsByClassName( 'update-plugin__plugin-action-status' )[ 0 ].textContent
		).toEqual( 'Updating' );
	} );

	test( 'should render correctly and show completed status for plugin update', () => {
		const updatedInitialState = {
			...initialState,
		};
		updatedInitialState.plugins.installed.status = {
			[ `${ site.ID }` ]: {
				[ plugin.id ]: { status: 'completed', action: UPDATE_PLUGIN },
			},
		};
		const store = mockStore( updatedInitialState );
		const { container } = render(
			<Provider store={ store }>
				<UpdatePlugin { ...props } />
			</Provider>
		);

		expect(
			container.getElementsByClassName( 'update-plugin__plugin-action-status' )[ 0 ].textContent
		).toEqual( 'Update successful' );
	} );

	test( 'should render correctly and show up-to-date status for plugin update', () => {
		const updatedInitialState = {
			...initialState,
		};
		updatedInitialState.plugins.installed.status = {
			[ `${ site.ID }` ]: {
				[ plugin.id ]: { status: 'up-to-date', action: UPDATE_PLUGIN },
			},
		};
		const store = mockStore( updatedInitialState );
		const { container } = render(
			<Provider store={ store }>
				<UpdatePlugin { ...props } />
			</Provider>
		);

		expect(
			container.getElementsByClassName( 'update-plugin__plugin-action-status' )[ 0 ].textContent
		).toEqual( 'Plugin already up to date' );
	} );

	test( 'should render correctly and show error status of plugin update', async () => {
		const updatedInitialState = {
			...initialState,
		};
		updatedInitialState.plugins.installed.status = {
			[ `${ site.ID }` ]: {
				[ plugin.id ]: { status: 'error', action: UPDATE_PLUGIN },
			},
		};
		const store = mockStore( updatedInitialState );
		const { container } = render(
			<Provider store={ store }>
				<UpdatePlugin { ...props } />
			</Provider>
		);

		expect(
			container.getElementsByClassName( 'update-plugin__plugin-action-status' )[ 0 ].textContent
		).toEqual( 'FailedRetry' );

		const [ retryButton ] = container.getElementsByClassName( 'update-plugin__retry-button' );
		expect( retryButton.textContent ).toEqual( 'Retry' );

		await userEvent.click( retryButton );
		expect( props.updatePlugin ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'should render correctly and show auto-managed', () => {
		site.jetpack = false;
		const updatedInitialState = {
			...initialState,
		};

		const store = mockStore( updatedInitialState );
		const { getAllByText } = render(
			<Provider store={ store }>
				<UpdatePlugin { ...props } />
			</Provider>
		);
		const [ autoManagedSite ] = getAllByText( 'Auto-managed on this site' );
		expect( autoManagedSite ).toBeInTheDocument();
	} );
} );
