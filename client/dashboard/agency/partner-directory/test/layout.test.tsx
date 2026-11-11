/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import PartnerDirectoryLayout from '../layout';

const API = 'https://public-api.wordpress.com';

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: 123, name: 'Test Agency', partner_directory: { allowed: false } } ] )
		.persist();
}

describe( '<PartnerDirectoryLayout>', () => {
	test( 'shows the tier upsell to agencies below Agency Partner', async () => {
		mockAgency();

		render( <PartnerDirectoryLayout /> );

		expect(
			await screen.findByText( 'Access this benefit when you become an Agency Partner.' )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Learn more' } ) ).toHaveAttribute(
			'href',
			'/tiers'
		);
	} );
} );
