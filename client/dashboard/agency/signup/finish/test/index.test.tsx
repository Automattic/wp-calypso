/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import AgencySignupFinish from '../index';
import type { SignupData } from '../signup-data';

const API_ROOT = 'https://public-api.wordpress.com';

const signupData: SignupData = {
	request: {
		first_name: 'Ada',
		last_name: 'Lovelace',
		agency_name: 'Analytical',
		agency_url: 'analytical.example',
		agency_size: '1-5',
		number_sites: '6-10',
		user_type: 'agency_owner',
		services_offered: [ 'design', 'hosting' ],
		products_offered: [],
		products_to_offer: [],
		address_line1: '',
		address_line2: '',
		address_city: 'London',
		address_country: 'GB',
		address_state: '',
		address_postal_code: '',
		phone_number: '',
		referral_status: '',
		skip_hubspot: false,
	},
	acquisition: { utm_source: 'newsletter' },
};

function mockAgency( response: { is_client_user: boolean } | { id: number }[] ) {
	nock( API_ROOT ).get( '/wpcom/v2/agency' ).query( true ).reply( 200, response );
}

describe( '<AgencySignupFinish>', () => {
	beforeEach( () => {
		window.localStorage.clear();
	} );

	test( 'creates the agency, clears the saved answers and opens Overview', async () => {
		window.localStorage.setItem( 'a4aSignupFormData', '{}' );
		document.cookie = 'hubspotutk=hubspot-visitor';
		mockAgency( { is_client_user: false } );
		const createScope = nock( API_ROOT )
			.post( '/wpcom/v2/agency', {
				...signupData.request,
				hubspotutk: 'hubspot-visitor',
			} )
			.reply( 200, { id: 5 } );

		const { router, recordTracksEvent } = render(
			<AgencySignupFinish signupData={ signupData } />
		);

		await waitFor( () => expect( router.state.location.pathname ).toBe( '/overview' ) );
		expect( createScope.isDone() ).toBe( true );
		expect( window.localStorage.getItem( 'a4aSignupFormData' ) ).toBeNull();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_create_agency_finish_submit',
			expect.objectContaining( {
				name: 'Analytical',
				services_offered: 'design,hosting',
				utm_source: 'newsletter',
			} )
		);
	} );

	test( 'opens Overview without creating another agency when the user already has one', async () => {
		mockAgency( [ { id: 5 } ] );
		const createScope = nock( API_ROOT ).post( '/wpcom/v2/agency' ).reply( 200, { id: 6 } );

		const { router } = render( <AgencySignupFinish signupData={ signupData } /> );

		await waitFor( () => expect( router.state.location.pathname ).toBe( '/overview' ) );
		expect( createScope.isDone() ).toBe( false );
	} );

	test( 'shows the error and a way back to signup when the agency is not created', async () => {
		mockAgency( { is_client_user: false } );
		nock( API_ROOT )
			.post( '/wpcom/v2/agency' )
			.reply( 400, { code: 'invalid_agency_url', message: 'The agency URL is not valid.' } );

		render( <AgencySignupFinish signupData={ signupData } /> );

		expect( await screen.findByText( 'The agency URL is not valid.' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Back to sign up' } ) ).toHaveAttribute(
			'href',
			'/signup'
		);
	} );
} );
