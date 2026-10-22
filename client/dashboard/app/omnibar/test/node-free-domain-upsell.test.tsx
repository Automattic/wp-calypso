/**
 * @jest-environment jsdom
 */

import { omnibarSiteIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import { wpcomLink } from '../../../utils/link';
import { shoppingCartManagerClient } from '../../shopping-cart';
import OmnibarContainer from '../omnibar';

const site = {
	ID: 1,
	name: 'Test Site',
	site_migration: {},
};

const freeDomainUpsellNode = {
	id: 'free-domain-upsell',
	title:
		'<span class="ab-icon" aria-hidden="true"><svg></svg></span><span class="ab-label">Free domain</span>',
	parent: null,
	href: 'https://wordpress.com/setup/domain-and-plan?siteSlug=test-site.wordpress.com&ref=omnibar-free-domain',
	group: false,
	meta: {
		title: 'Free domain with an annual plan',
		menu_title: 'Free domain',
		upsell_source: 'free_to_paid_plan',
	},
};

const upsellEventProps = {
	upsell_id: 'omnibar-free-domain',
	upsell_source: 'free_to_paid_plan',
	source: 'dashboard',
};

function renderOmnibar() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( omnibarSiteIdQuery().queryKey, site.ID );

	return render(
		<OmnibarContainer cartManagerClient={ shoppingCartManagerClient } sectionName="dashboard" />,
		{ queryClient }
	);
}

describe( '<Omnibar> free domain upsell node', () => {
	beforeEach( () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/dashboard/admin-bar' )
			.query( true )
			.reply( 200, { nodes: [] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/${ site.ID }/admin-bar` )
			.query( true )
			.reply( 200, { nodes: [ freeDomainUpsellNode ] } );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.1/sites/${ site.ID }` )
			.query( true )
			.reply( 200, site );
	} );

	afterEach( () => nock.cleanAll() );

	test( 'shows the node', async () => {
		const { recordTracksEvent } = renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		const node = await within( toolbar ).findByRole( 'button', { name: 'Free domain' } );
		expect( within( node ).getByText( 'Free domain' ) ).toBeVisible();
		expect( node ).toHaveAttribute(
			'href',
			wpcomLink( '/setup/domain-and-plan?siteSlug=test-site.wordpress.com&ref=omnibar-free-domain' )
		);
		await waitFor( () =>
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_omnibar_upsell_impression',
				upsellEventProps
			)
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_omnibar_upsell_click',
			expect.anything()
		);
	} );

	test( 'records a click when clicking the node', async () => {
		const user = userEvent.setup();
		const { recordTracksEvent } = renderOmnibar();

		const toolbar = screen.getByRole( 'navigation', { name: 'Toolbar' } );
		await user.click( await within( toolbar ).findByRole( 'button', { name: 'Free domain' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_omnibar_upsell_click',
			upsellEventProps
		);
	} );
} );
