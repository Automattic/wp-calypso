/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import plugins from 'calypso/state/plugins/reducer';
import productsList from 'calypso/state/products-list/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { PluginsList } from '..';
import { sites, sitesObject } from './fixtures';

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { plugins, ui, productsList } } );

describe( 'PluginsList', () => {
	const pluginsList = [
		{ sites: sitesObject, slug: 'hello', name: 'Hello Dolly' },
		{ sites: sitesObject, slug: 'arbitrary-plugin', name: 'Arbitrary Plugin' },
		{ sites: sitesObject, slug: 'jetpack', name: 'Jetpack' },
	];

	const props = {
		plugins: pluginsList,
		header: 'Plugins',
		selectedSite: sites[ 0 ],
		selectedSiteId: sites[ 0 ].ID,
		isPlaceholder: false,
		pluginUpdateCount: pluginsList.length,
		inProgressStatuses: [],
		pluginsOnSites: {
			hello: pluginsList[ 0 ],
			jetpack: pluginsList[ 1 ],
		},
		allSites: sites,
		hasManagePlugins: true,
		siteIsAtomic: true,
		removePluginStatuses: () => {},
	};

	describe( 'rendering bulk actions', () => {
		test( 'should select all plugins when toggled on (site is Atomic)', async () => {
			const user = userEvent.setup();
			render( <PluginsList { ...props } /> );
			const toggleBtn = screen.queryByRole( 'button', { name: 'Edit All' } );
			await user.click( toggleBtn );
			// Jetpack is auto-managed on Atomic sites, therefore there's only 'Hello Dolly' in here
			const boxes = screen.queryAllByRole( 'checkbox', { checked: true } );
			expect( boxes ).toHaveLength( 2 );
			expect( boxes[ 0 ] ).toHaveAttribute( 'title', 'Hello Dolly' );
		} );

		test( 'should select all plugins when toggled on (site is Jetpack)', async () => {
			const user = userEvent.setup();
			render( <PluginsList { ...props } siteIsAtomic={ false } siteIsJetpack /> );
			const toggleBtn = screen.queryByRole( 'button', { name: 'Edit All' } );
			await user.click( toggleBtn );

			pluginsList.forEach( ( plugin ) => {
				const box = screen.queryByRole( 'checkbox', { name: plugin.name } );
				expect( box ).toBeVisible();
				expect( box ).toBeChecked();
			} );
		} );

		test( 'should always reset to all selected when toggled on', async () => {
			const getSelectedPluginBoxes = () =>
				pluginsList
					.map( ( plugin ) =>
						screen.queryByRole( 'checkbox', { name: plugin.name, checked: true } )
					)
					.filter( ( i ) => i );

			const user = userEvent.setup();
			render( <PluginsList { ...props } /> );

			await user.click( screen.getByRole( 'button', { name: 'Edit All' } ) );

			expect( getSelectedPluginBoxes() ).toHaveLength( 2 );

			const dollyBox = screen.queryByRole( 'checkbox', { name: 'Hello Dolly' } );
			await user.click( dollyBox );

			expect( getSelectedPluginBoxes() ).toHaveLength( 1 );
			expect( screen.queryByRole( 'checkbox', { name: 'Hello Dolly' } ) ).not.toBeChecked();

			await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Edit All' } ) );

			expect( getSelectedPluginBoxes() ).toHaveLength( 2 );
		} );
	} );
} );
