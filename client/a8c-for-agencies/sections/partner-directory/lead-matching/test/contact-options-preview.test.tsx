/**
 * @jest-environment jsdom
 */
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { getLeadMatchingProfileQueryKey } from 'calypso/a8c-for-agencies/data/partner-directory/use-lead-matching-profile';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import agencyReducer from 'calypso/state/a8c-for-agencies/reducer';
import countriesReducer from 'calypso/state/countries/reducer';
import noticesReducer from 'calypso/state/notices/reducer';
import { getNotices } from 'calypso/state/notices/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import {
	createDefaultLeadMatchingProfile,
	mapLeadMatchingProfileToFormData,
} from '../../utils/map-application-form-data';
import LeadMatchingForm from '../index';
import type { AgencyLeadMatchingProfile, AgencyLeadMatchingResponse } from '../../types';

const API = 'https://public-api.wordpress.com';

Element.prototype.scrollIntoView = jest.fn();

function SavedForm() {
	const profile = useSelector( getActiveAgency )?.lead_matching?.profile;
	const notices = useSelector( getNotices );
	return (
		<>
			{ notices.map( ( notice ) => (
				<p key={ notice.noticeId }>{ notice.text }</p>
			) ) }
			<LeadMatchingForm
				profile={ profile }
				initialFormData={ mapLeadMatchingProfileToFormData( profile ) }
			/>
		</>
	);
}

function renderForm( profile: AgencyLeadMatchingProfile, queryClient = new QueryClient() ) {
	return renderWithProvider( <SavedForm />, {
		queryClient,
		reducers: {
			a8cForAgencies: agencyReducer,
			countries: countriesReducer,
			notices: noticesReducer,
		},
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
	const user = userEvent.setup();
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
	expect( phone ).toHaveValue( '02012345678 ext 12' );
	expect( booking ).toHaveValue( profile.contact.booking_link );
	await user.clear( phone );
	await user.paste( '+44 (20) 8765 4321 ext 1234567890' );
	await userEvent.clear( booking );
	await userEvent.type( booking, 'booking.example.com/intro?source=A4A' );
	await userEvent.click( screen.getByRole( 'button', { name: 'Update preferences' } ) );
	await waitFor( () => expect( phone ).toHaveValue( '02087654321 ext 1234567890' ) );
	expect( savedProfile.contact?.phone ).toBe( '+442087654321 ext 1234567890' );
	expect( booking ).toHaveValue( 'https://booking.example.com/intro?source=A4A' );
	expect( savedProfile.availability.profile_v2_complete ).toBe( false );
	expect( savedProfile.geography_and_language.global_remote ).toBe( false );
	expect( await screen.findByText( 'Saved', { exact: true } ) ).toBeVisible();
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

test( 'saves preferences while retaining skipped contacts and failed saves in the draft', async () => {
	const profile = createDefaultLeadMatchingProfile();
	profile.contact = { phone: '+442012345678 ext 12', booking_link: 'https://book.example.com' };
	profile.geography_and_language.supported_languages = [ 'en' ];
	const queryClient = new QueryClient();
	const partialScope = nock( API )
		.put( '/wpcom/v2/agency/123/lead-matching', ( body ) => {
			expect( body.contact ).toEqual( { phone: '+44abc1234', booking_link: 'https://not a URL' } );
			expect( body.geography_and_language.supported_languages ).toEqual( [ 'en' ] );
			return true;
		} )
		.query( true )
		.reply( 200, ( _uri, body ) => ( {
			agency_id: 123,
			lead_matching_profile: { ...( body as AgencyLeadMatchingProfile ), contact: {} },
			ignored_contact_fields: [ 'phone', 'booking_link' ],
		} ) );
	const scope = nock( API )
		.put( '/wpcom/v2/agency/123/lead-matching' )
		.query( true )
		.reply( 400, { code: 'invalid_contact', message: 'Invalid contact' } );
	renderForm( profile, queryClient );
	const phone = screen.getByRole( 'textbox', { name: 'Phone number (optional)' } );
	const booking = screen.getByRole( 'textbox', { name: /Booking link/ } );
	await userEvent.clear( phone );
	await userEvent.type( phone, '+44abc1234{Enter}' );
	await userEvent.clear( booking );
	await userEvent.type( booking, 'not a URL{Enter}' );
	await userEvent.click( screen.getByRole( 'button', { name: 'Update preferences' } ) );
	expect(
		await screen.findByText( /Preferences saved, but.*Phone number, Booking link/ )
	).toBeVisible();
	expect( partialScope.isDone() ).toBe( true );
	expect( phone ).toHaveValue( '+44abc1234' );
	expect( booking ).toHaveValue( 'https://not a URL' );
	expect( screen.queryByText( 'Saved', { exact: true } ) ).not.toBeInTheDocument();
	const saved = queryClient.getQueryData< AgencyLeadMatchingResponse >(
		getLeadMatchingProfileQueryKey( 123 )
	);
	expect( saved?.lead_matching_profile.contact ).toEqual( profile.contact );
	expect( saved?.lead_matching_profile.geography_and_language.supported_languages ).toEqual( [
		'en',
	] );
	expect( scope.isDone() ).toBe( false );
	await userEvent.clear( phone );
	await userEvent.type( phone, '+1234' );
	await userEvent.clear( booking );
	await userEvent.click( screen.getByRole( 'button', { name: 'Update preferences' } ) );
	await waitFor( () => expect( scope.isDone() ).toBe( true ) );
	expect( await screen.findByText( 'Couldn’t save changes' ) ).toBeVisible();
	expect( phone ).toHaveValue( '234' );
	await userEvent.click(
		screen.getByRole( 'checkbox', { name: 'We support global / remote clients' } )
	);
	await userEvent.click( screen.getByRole( 'button', { name: 'Update preferences' } ) );
	expect( await screen.findByText( 'Please select at least one region' ) ).toBeVisible();
} );
