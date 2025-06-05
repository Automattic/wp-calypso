/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { WPCOM_FEATURES_INSTALL_PLUGINS } from '@automattic/calypso-products';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import React from 'react';
import documentHead from 'calypso/state/document-head/reducer';
import marketplace from 'calypso/state/marketplace/reducer';
import plugins from 'calypso/state/plugins/reducer';
import productsList from 'calypso/state/products-list/reducer';
import siteConnection from 'calypso/state/site-connection/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PluginRowFormatter from '../plugin-row-formatter';
import { site, plugin, paidPlugin } from './utils/constants';

const initialReduxState = {
	siteConnection: { items: { [ site.ID ]: true } },
	sites: {
		items: { [ site.ID ]: site },
		features: { [ site.ID ]: { data: { active: [ WPCOM_FEATURES_INSTALL_PLUGINS ] } } },
	},
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
		},
	},
	productsList: {
		items: {},
	},
	marketplace: {
		billingInterval: {
			interval: 'yearly',
		},
	},
};

const render = ( el, partialState ) =>
	renderWithProvider( el, {
		initialState: { ...initialReduxState, ...partialState },
		reducers: { ui, plugins, documentHead, productsList, siteConnection, marketplace },
		store: undefined,
	} );

const props = {
	item: plugin,
	columnKey: 'site-name',
	selectedSite: { ...site, canUpdateFiles: true },
	isSmallScreen: false,
};

describe( '<PluginRowFormatter>', () => {
	beforeAll( () => {
		window.matchMedia = jest.fn().mockImplementation( ( query ) => {
			return {
				matches: true,
				media: query,
				onchange: null,
				addListener: jest.fn(),
				removeListener: jest.fn(),
			};
		} );
	} );

	test( 'should render correctly and show site domain', () => {
		const { container } = render( <PluginRowFormatter { ...props } /> );

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__row-container' );
		expect( value.textContent ).toEqual( site.domain );
	} );

	test( 'should render correctly and show plugin name', () => {
		props.columnKey = 'plugin';
		const { container } = render( <PluginRowFormatter { ...props } /> );

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__plugin-name' );
		expect( value.textContent ).toEqual( plugin.name );
	} );

	test( 'should render correctly and show site count', () => {
		props.columnKey = 'sites';
		const { container } = render( <PluginRowFormatter { ...props } /> );

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
		const { getAllByText } = render( <PluginRowFormatter { ...props } /> );

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
		const { getAllByText } = render( <PluginRowFormatter { ...props } /> );

		const [ autoManagedSite ] = getAllByText(
			`Installed on ${ Object.keys( plugin.sites ).length } sites`
		);
		expect( autoManagedSite ).toBeInTheDocument();
	} );

	test( 'should render correctly and show activate and toggle checked value', async () => {
		props.columnKey = 'activate';
		const { container } = render( <PluginRowFormatter { ...props } /> );

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__toggle' );
		expect( value.textContent ).toEqual( 'Active' );

		const [ toggleButton ] = value.getElementsByClassName( 'components-form-toggle__input' );
		expect( toggleButton ).toHaveProperty( 'checked', false );
		await userEvent.click( toggleButton );
		expect( toggleButton ).toHaveProperty( 'checked', true );
	} );

	test( 'should render correctly and show auto-update and toggle checked value', async () => {
		props.columnKey = 'autoupdate';
		const { container } = render( <PluginRowFormatter { ...props } /> );

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__toggle' );
		expect( value.textContent ).toEqual( 'Autoupdates' );

		const [ toggleButton ] = value.getElementsByClassName( 'components-form-toggle__input' );
		expect( toggleButton ).toHaveProperty( 'checked', false );
		await userEvent.click( toggleButton );
		expect( toggleButton ).toHaveProperty( 'checked', true );
	} );

	test( 'should render correctly and show last updated', () => {
		props.columnKey = 'last-updated';
		const { container } = render( <PluginRowFormatter { ...props } /> );

		const [ value ] = container.getElementsByClassName( 'plugin-row-formatter__last-updated' );
		expect( value.textContent ).toEqual(
			`Updated ${ moment.utc( plugin.last_updated, 'YYYY-MM-DD hh:mma' ).fromNow() }`
		);
	} );

	test( 'should render correctly and show install button', () => {
		props.columnKey = 'install';
		const { getAllByText } = render( <PluginRowFormatter { ...props } />, {
			sites: {
				items: { [ site.ID ]: { ...site, options: { ...site.options, is_wpcom_atomic: true } } },
				features: initialReduxState.sites.features,
			},
		} );

		const [ autoManagedSite ] = getAllByText( 'Install' );
		expect( autoManagedSite ).toBeInTheDocument();
	} );

	test( 'should render correctly and show disabled upgrade button', () => {
		props.columnKey = 'install';
		const { getAllByText } = render( <PluginRowFormatter { ...props } item={ paidPlugin } /> );

		const [ autoManagedSite ] = getAllByText( 'Upgrade disabled' );
		expect( autoManagedSite ).toBeInTheDocument();
	} );
} );
