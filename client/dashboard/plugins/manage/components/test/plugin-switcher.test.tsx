/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import { PluginSwitcher } from '../plugin-switcher';
import type { PluginListRow } from '../../types';
import type { Field, View } from '@wordpress/dataviews';

const searchableFields: Field< PluginListRow >[] = [
	{ id: 'name', getValue: ( { item } ) => item.name },
	{ id: 'slug', getValue: ( { item } ) => item.slug },
];

const akismet = {
	id: 'akismet/akismet',
	slug: 'akismet',
	name: 'Akismet Anti-spam: Spam Protection',
	sitesWithPluginUpdate: [] as number[],
} as PluginListRow;

const baseView: View = {
	type: 'list',
	page: 1,
	perPage: 100,
	sort: { field: 'name', direction: 'asc' },
};

describe( '<PluginSwitcher> – no-results empty state (DOTMSD-1343)', () => {
	test( 'shows a "No plugins found." empty state when the search matches nothing', () => {
		render(
			<PluginSwitcher
				pluginsWithIcon={ [ akismet ] }
				searchableFields={ searchableFields }
				view={ { ...baseView, search: 'zzznotarealplugin' } }
				onChangeView={ () => {} }
				paginationInfo={ { totalItems: 0, totalPages: 0 } }
			/>
		);

		expect( screen.getByText( 'No plugins found.' ) ).toBeVisible();
		// The non-matching plugin must not be rendered in the list.
		expect( screen.queryByText( akismet.name ) ).not.toBeInTheDocument();
	} );

	test( 'shows the empty state when there are no plugins at all', () => {
		render(
			<PluginSwitcher
				pluginsWithIcon={ [] }
				searchableFields={ searchableFields }
				view={ baseView }
				onChangeView={ () => {} }
				paginationInfo={ { totalItems: 0, totalPages: 0 } }
			/>
		);

		expect( screen.getByText( 'No plugins found.' ) ).toBeVisible();
	} );
} );
