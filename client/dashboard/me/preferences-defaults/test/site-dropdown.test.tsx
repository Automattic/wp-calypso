/**
 * @jest-environment jsdom
 */

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import PreferencesLoginSiteDropdown from '../site-dropdown';
import type { Site } from '@automattic/api-core';

// The suggestions list scrolls the highlighted option into view, which JSDOM lacks.
Element.prototype.scrollIntoView = jest.fn();

const wombats = {
	ID: 1,
	name: 'Wombat Weekly',
	URL: 'https://marsupials.example.com',
	slug: 'marsupials.example.com',
	site_migration: { migration_status: '' },
} as Site;

const badgers = {
	ID: 2,
	name: 'Badger Digest',
	URL: 'https://mustelids.example.com',
	slug: 'mustelids.example.com',
	site_migration: { migration_status: '' },
} as Site;

function renderDropdown( sites: Site[] = [ wombats, badgers ] ) {
	const onChange = jest.fn();
	render(
		<PreferencesLoginSiteDropdown sites={ sites } value="" onChange={ onChange } label="Site" />
	);
	return { onChange };
}

function suggestions() {
	return within( screen.getByRole( 'listbox' ) ).getAllByRole( 'option' );
}

describe( '<PreferencesLoginSiteDropdown>', () => {
	test( 'finds a site by its title', async () => {
		const currentUser = userEvent.setup();
		renderDropdown();

		await currentUser.type( screen.getByRole( 'combobox', { name: 'Site' } ), 'Badger' );

		expect( suggestions() ).toHaveLength( 1 );
		expect( suggestions()[ 0 ] ).toHaveTextContent( 'Badger Digest' );
		expect( suggestions()[ 0 ] ).toHaveTextContent( 'mustelids.example.com' );
	} );

	test( 'finds a site by its primary domain', async () => {
		const currentUser = userEvent.setup();
		renderDropdown();

		await currentUser.type( screen.getByRole( 'combobox', { name: 'Site' } ), 'mustelids' );

		expect( suggestions() ).toHaveLength( 1 );
		expect( suggestions()[ 0 ] ).toHaveTextContent( 'Badger Digest' );
		expect( suggestions()[ 0 ] ).toHaveTextContent( 'mustelids.example.com' );
	} );

	test( 'selects a site found by its primary domain', async () => {
		const currentUser = userEvent.setup();
		const { onChange } = renderDropdown();

		await currentUser.type( screen.getByRole( 'combobox', { name: 'Site' } ), 'mustelids' );
		await currentUser.click( suggestions()[ 0 ] );

		expect( onChange ).toHaveBeenCalledWith( String( badgers.ID ) );
	} );
} );
