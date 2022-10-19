/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { ACTIVATE_PLUGIN } from 'calypso/lib/plugins/constants';
import PluginCommonCard from '../plugin-common/plugin-common-card';
import PluginRowFormatter from '../plugin-row-formatter';
import { plugin, site } from './utils/constants';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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
	item: plugin,
	isLoading: false,
	columns: [
		{
			key: 'plugin',
			header: translate( 'Installed Plugins' ),
		},
	],
	rowFormatter: function ( props ): React.ReactNode {
		return <PluginRowFormatter { ...props } selectedSite={ site } updatePlugin={ noop } />;
	},
	selectedSite: site,
	primaryKey: 'id',
};

describe( '<PluginCommonCard>', () => {
	const mockStore = configureStore();
	const store = mockStore( initialState );

	test( 'should render the columns provided and display plugin data', () => {
		render(
			<Provider store={ store }>
				<PluginCommonCard { ...props } />
			</Provider>
		);
		const pluginName = screen.getByRole( 'link', { name: plugin.name } );
		expect( pluginName ).toHaveProperty(
			'href',
			`https://example.com/plugins/${ plugin.slug }/${ site.slug }`
		);
	} );
} );
