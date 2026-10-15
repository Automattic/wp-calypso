/**
 * @jest-environment jsdom
 */

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import { SitesWithoutThisPlugin } from '../sites-without-this-plugin';
import type { Site } from '@automattic/api-core';

function makeSite( id: number, name: string, planName: string ): Site {
	return {
		ID: id,
		name,
		slug: `site-${ id }.wordpress.com`,
		URL: `https://site-${ id }.wordpress.com`,
		capabilities: {},
		site_migration: {},
		jetpack: false,
		is_coming_soon: false,
		is_private: false,
		plan: { product_slug: 'business-bundle', product_name_short: planName, features: {} },
	} as unknown as Site;
}

describe( '<SitesWithoutThisPlugin>', () => {
	test( 'sorts sites by plan', async () => {
		const user = userEvent.setup();
		render(
			<SitesWithoutThisPlugin
				pluginSlug="test-plugin"
				pluginName="Test Plugin"
				isLoading={ false }
				sitesWithoutThisPlugin={ [
					makeSite( 1, 'Site A', 'Personal' ),
					makeSite( 2, 'Site B', 'Business' ),
				] }
			/>
		);

		const table = await screen.findByRole( 'table' );
		await user.click( within( table ).getByRole( 'button', { name: 'Plan' } ) );
		await user.click( await screen.findByRole( 'menuitemradio', { name: 'Sort ascending' } ) );

		expect(
			within( table )
				.getAllByText( /^Site [AB]$/ )
				.map( ( element ) => element.textContent )
		).toEqual( [ 'Site B', 'Site A' ] );
	} );
} );
