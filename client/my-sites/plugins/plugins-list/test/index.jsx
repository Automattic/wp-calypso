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
			await user.click( screen.getByRole( 'button', { name: 'Edit All' } ) );
			// Jetpack is auto-managed on Atomic sites, therefore there's only 2 checkboxes here
			const pluginCheckboxes = screen.queryAllByRole( 'checkbox', { checked: true } );
			expect( pluginCheckboxes ).toHaveLength( 2 );
			expect( pluginCheckboxes[ 0 ] ).toHaveAttribute( 'title', 'Hello Dolly' );
		} );

		test( 'should select all plugins when toggled on (site is Jetpack)', async () => {
			const user = userEvent.setup();
			render( <PluginsList { ...props } siteIsAtomic={ false } siteIsJetpack /> );
			await user.click( screen.getByRole( 'button', { name: 'Edit All' } ) );

			pluginsList.forEach( ( plugin ) => {
				const pluginCheckbox = screen.getByRole( 'checkbox', { name: plugin.name } );
				expect( pluginCheckbox ).toBeVisible();
				expect( pluginCheckbox ).toBeChecked();
			} );
		} );

		test( 'should always reset to all selected when toggled on', async () => {
			const querySelectedPluginBoxes = () =>
				pluginsList
					.map( ( { name } ) => screen.queryByRole( 'checkbox', { name, checked: true } ) )
					.filter( ( i ) => i );

			const user = userEvent.setup();
			render( <PluginsList { ...props } /> );

			await user.click( screen.getByRole( 'button', { name: 'Edit All' } ) );

			expect( querySelectedPluginBoxes() ).toHaveLength( 2 );

			const helloDollyCheckbox = screen.getByRole( 'checkbox', { name: 'Hello Dolly' } );
			await user.click( helloDollyCheckbox );

			expect( querySelectedPluginBoxes() ).toHaveLength( 1 );
			expect( screen.queryByRole( 'checkbox', { name: 'Hello Dolly' } ) ).not.toBeChecked();

			await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Edit All' } ) );

			expect( querySelectedPluginBoxes() ).toHaveLength( 2 );
		} );
	} );
} );
