/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import agencyReducer from 'calypso/state/a8c-for-agencies/reducer';
import countriesReducer from 'calypso/state/countries/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import {
	createDefaultLeadMatchingProfile,
	mapLeadMatchingProfileToFormData,
} from '../../utils/map-application-form-data';
import LeadMatchingForm from '../index';
import type { AgencyLeadMatchingProfile } from '../../types';

const API = 'https://public-api.wordpress.com';

Element.prototype.scrollIntoView = jest.fn();

function SavedForm() {
	const profile = useSelector( getActiveAgency )?.lead_matching?.profile;
	return (
		<LeadMatchingForm
			profile={ profile }
			initialFormData={ mapLeadMatchingProfileToFormData( profile ) }
		/>
	);
}

function renderForm( profile: AgencyLeadMatchingProfile ) {
	return renderWithProvider( <SavedForm />, {
		reducers: { a8cForAgencies: agencyReducer, countries: countriesReducer },
		initialState: {
			a8cForAgencies: {
				agencies: {
					isFetching: false,
					activeAgency: {
						id: 123,
						profile: {
							company_details: { country: 'GB' },
							listing_details: { is_available: true },
						},
						lead_matching: { profile },
					},
				},
			},
			countries: {
				sms: [
					{
						code: 'GB',
						name: 'United Kingdom (+44)',
						numeric_code: '+44',
						country_name: 'United Kingdom',
					},
				],
			},
		},
	} );
}

test( 'hydrates and saves contact-only changes on an incomplete profile, then clears them', async () => {
	const profile = createDefaultLeadMatchingProfile();
	// GET returns a nullable completion flag and can return unset boolean answers.
	profile.availability.profile_v2_complete = null;
	profile.geography_and_language.global_remote = null;
	profile.contact = { phone: '+442012345678 ext 12', booking_link: 'http://book.example.com/?a=1' };
	let savedProfile = profile;
	const scope = nock( API )
		.put( '/wpcom/v2/agency/123/lead-matching' )
		.query( true )
		.twice()
		.reply( 200, ( _uri, body ) => {
			savedProfile = body as AgencyLeadMatchingProfile;
			return { agency_id: 123, lead_matching_profile: savedProfile };
		} );
	const view = renderForm( profile );
	const phone = screen.getByRole( 'textbox', { name: 'Phone number (optional)' } );
	const booking = screen.getByRole( 'textbox', { name: /Booking link/ } );
	expect( phone ).toHaveValue( profile.contact.phone );
	expect( booking ).toHaveValue( profile.contact.booking_link );
	await userEvent.clear( phone );
	await userEvent.type( phone, '020 8765 4321 ext9' );
	await userEvent.clear( booking );
	await userEvent.type( booking, 'booking.example.com/intro?source=A4A' );
	await userEvent.click( screen.getByRole( 'button', { name: 'Update preferences' } ) );
	await waitFor( () => expect( phone ).toHaveValue( '+442087654321 ext 9' ) );
	expect( booking ).toHaveValue( 'https://booking.example.com/intro?source=A4A' );
	expect( savedProfile.availability.profile_v2_complete ).toBe( false );
	expect( savedProfile.geography_and_language.global_remote ).toBe( false );
	expect( screen.getByText( 'Saved', { exact: true } ) ).toBeVisible();
	await userEvent.clear( phone );
	await userEvent.clear( booking );
	await userEvent.click( screen.getByRole( 'button', { name: 'Update preferences' } ) );
	await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	expect( savedProfile.contact ).toEqual( { phone: '', booking_link: '' } );
	await waitFor( () => expect( screen.getByText( 'Saved', { exact: true } ) ).toBeVisible() );
	view.unmount();
	renderForm( savedProfile );
	expect( screen.getByRole( 'textbox', { name: 'Phone number (optional)' } ) ).toHaveValue( '' );
	expect( screen.getByRole( 'textbox', { name: /Booking link/ } ) ).toHaveValue( '' );
} );

test( 'keeps invalid contacts and failed saves in the draft', async () => {
	const scope = nock( API )
		.put( '/wpcom/v2/agency/123/lead-matching' )
		.query( true )
		.reply( 400, { code: 'invalid_contact', message: 'Invalid contact' } );
	renderForm( createDefaultLeadMatchingProfile() );
	const phone = screen.getByRole( 'textbox', { name: 'Phone number (optional)' } );
	const booking = screen.getByRole( 'textbox', { name: /Booking link/ } );
	expect( phone ).toHaveValue( '' );
	await userEvent.type( phone, '+44abc1234{Enter}' );
	await userEvent.type( booking, 'not a URL{Enter}' );
	await userEvent.click( screen.getByRole( 'button', { name: 'Update preferences' } ) );
	expect( await screen.findByText( 'Enter a valid HTTP or HTTPS booking link.' ) ).toBeVisible();
	expect( phone ).toHaveValue( '+44abc1234' );
	expect( scope.isDone() ).toBe( false );
	await userEvent.clear( phone );
	await userEvent.type( phone, '+1234' );
	await userEvent.clear( booking );
	await userEvent.click( screen.getByRole( 'button', { name: 'Update preferences' } ) );
	await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	expect( await screen.findByText( 'Couldn’t save changes' ) ).toBeVisible();
	expect( phone ).toHaveValue( '+1234' );
	await userEvent.click(
		screen.getByRole( 'checkbox', { name: 'We support global / remote clients' } )
	);
	await userEvent.click( screen.getByRole( 'button', { name: 'Update preferences' } ) );
	expect( await screen.findByText( 'Please select at least one region' ) ).toBeVisible();
} );
