/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ACTIVATE_PLUGIN } from 'calypso/lib/plugins/constants';
import PluginRowFormatter from '../plugin-row-formatter';
import { site, plugin } from './utils/constants';

const initialState = {
	sites: { items: { [ site.ID ]: site }, connection: { items: { [ site.ID ]: true } } },
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
	productsList: {
		items: {},
	},
};

const props = {
	item: plugin,
	columnKey: 'site-name',
	selectedSite: { ...site, canUpdateFiles: true },
	isSmallScreen: false,
};

describe( '<PluginRowFormatter>', () => {
	const middlewares = [ thunk ];

	const mockStore = configureStore( middlewares );
	const store = mockStore( initialState );

	test( 'should render correctly and show site domain', () => {
		const { container } = render(
			<Provider store={ store }>
				<PluginRowFormatter { ...props } />
			</Provider>
		);

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__row-container' );
		expect( value.textContent ).toEqual( site.domain );
	} );

	test( 'should render correctly and show plugin name', () => {
		props.columnKey = 'plugin';
		const { container } = render(
			<Provider store={ store }>
				<PluginRowFormatter { ...props } />
			</Provider>
		);

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__plugin-name' );
		expect( value.textContent ).toEqual( plugin.name );
	} );

	test( 'should render correctly and show site count', () => {
		props.columnKey = 'sites';
		const { container } = render(
			<Provider store={ store }>
				<PluginRowFormatter { ...props } />
			</Provider>
		);

		const [ value ] = container.getElementsByClassName(
			'plugin-row-formatter__sites-count-button'
		);
		expect( value.textContent && parseInt( value.textContent ) ).toEqual(
			Object.keys( plugin.sites ).length
		);
	} );

	test( 'should render correctly and show site count(singular) on small screen', () => {
		props.columnKey = 'sites';
		props.isSmallScreen = true;
		const { getAllByText } = render(
			<Provider store={ store }>
				<PluginRowFormatter { ...props } />
			</Provider>
		);

		const [ autoManagedSite ] = getAllByText(
			`Installed on ${ Object.keys( plugin.sites ).length } site`
		);
		expect( autoManagedSite ).toBeInTheDocument();
	} );

	test( 'should render correctly and show site count(plural) on small screen', () => {
		props.columnKey = 'sites';
		plugin.sites = {
			[ site.ID ]: { ID: site.ID, canUpdateFiles: true },
			[ site.ID + 1 ]: { ID: site.ID + 1, canUpdateFiles: true },
		};
		const { getAllByText } = render(
			<Provider store={ store }>
				<PluginRowFormatter { ...props } />
			</Provider>
		);

		const [ autoManagedSite ] = getAllByText(
			`Installed on ${ Object.keys( plugin.sites ).length } sites`
		);
		expect( autoManagedSite ).toBeInTheDocument();
	} );

	test( 'should render correctly and show activate and toggle checked value', async () => {
		props.columnKey = 'activate';
		const { container } = render(
			<Provider store={ store }>
				<PluginRowFormatter { ...props } />
			</Provider>
		);

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__toggle' );
		expect( value.textContent ).toEqual( 'Active' );

		const [ toggleButton ] = value.getElementsByClassName( 'components-form-toggle__input' );
		expect( toggleButton ).toHaveProperty( 'checked', false );
		await userEvent.click( toggleButton );
		expect( toggleButton ).toHaveProperty( 'checked', true );
	} );

	test( 'should render correctly and show auto-update and toggle checked value', async () => {
		props.columnKey = 'autoupdate';
		const { container } = render(
			<Provider store={ store }>
				<PluginRowFormatter { ...props } />
			</Provider>
		);

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__toggle' );
		expect( value.textContent ).toEqual( 'Autoupdates' );

		const [ toggleButton ] = value.getElementsByClassName( 'components-form-toggle__input' );
		expect( toggleButton ).toHaveProperty( 'checked', false );
		await userEvent.click( toggleButton );
		expect( toggleButton ).toHaveProperty( 'checked', true );
	} );

	test( 'should render correctly and show last updated', () => {
		props.columnKey = 'last-updated';
		const { container } = render(
			<Provider store={ store }>
				<PluginRowFormatter { ...props } />
			</Provider>
		);

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__last-updated' );
		expect( value.textContent ).toEqual(
			`Updated ${ moment.utc( plugin.last_updated, 'YYYY-MM-DD hh:mma' ).fromNow() }`
		);
	} );

	test( 'should render correctly and show install button', () => {
		props.columnKey = 'install';
		const { getAllByText } = render(
			<Provider store={ store }>
				<PluginRowFormatter { ...props } />
			</Provider>
		);

		const [ autoManagedSite ] = getAllByText( `Install` );
		expect( autoManagedSite ).toBeInTheDocument();
	} );
} );
