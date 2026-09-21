/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import WpcomSection from '../wpcom-section';
import type { AgencyProduct } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

const plan: AgencyProduct = {
	name: 'WordPress.com Business',
	slug: 'wpcom-hosting-business',
	product_id: 1,
	currency: 'USD',
	family_slug: 'wpcom-hosting',
	monthly_price: 25,
	yearly_price: 250,
};

// The development CTA opens the configuration modal in place, which needs an
// agency to create against and an address to suggest.
function mockDevSiteModal() {
	nock( API )
		.persist()
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 1 } ] );
	nock( API )
		.persist()
		.get( '/wpcom/v2/site-suggestions' )
		.reply( 200, { suggestions: [ { title: 'Rambling Thoughts' } ] } );
	nock( API )
		.persist()
		.get( '/rest/v1.1/domains/suggestions' )
		.query( true )
		.reply( 200, [ { domain_name: 'ramblingthoughts.wordpress.com' } ] );
}

function renderSection( props: Partial< React.ComponentProps< typeof WpcomSection > > = {} ) {
	return render(
		<WpcomSection
			plan={ plan }
			term="monthly"
			isReferralMode={ false }
			ownedSites={ 0 }
			isOwnedSitesReady
			isAgencyApproved
			availableDevSites={ 3 }
			onAddToCart={ jest.fn() }
			{ ...props }
		/>
	);
}

const devSiteButton = () => screen.getByRole( 'button', { name: 'Create a development site' } );

describe( '<WpcomSection>', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'configures the development site in place rather than leaving for the classic page', async () => {
		mockDevSiteModal();
		const { recordTracksEvent } = renderSection();

		await userEvent.click( devSiteButton() );

		expect(
			await screen.findByRole( 'dialog', { name: 'Configure your new site' } )
		).toBeVisible();
		await waitFor( () =>
			expect( screen.getByLabelText( 'Site address' ) ).toHaveValue( 'ramblingthoughts' )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_hosting_page_create_wpcom_dev_site_click'
		);
	} );

	test( 'blocks the development CTA with no free licenses left', () => {
		renderSection( { availableDevSites: 0 } );

		expect( devSiteButton() ).toBeDisabled();
	} );

	test( 'blocks the development CTA until the agency is approved', () => {
		renderSection( { isAgencyApproved: false } );

		expect( devSiteButton() ).toBeDisabled();
	} );
} );
