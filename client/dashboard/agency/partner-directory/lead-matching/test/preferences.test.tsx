/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { getEmptyLeadMatchingFormData, getLeadMatchingProfile } from '../form-data';
import AgencyPartnerDirectoryLeadMatchingPreferences from '../preferences';
import {
	API,
	completeProfile,
	mockAgency,
	mockLeadMatching,
	mockLeadMatchingSave,
	mockProfileSave,
	mockSmsCountryCodes,
} from './fixtures';
import type { AgencyLeadMatchingProfile } from '@automattic/api-core';

const noticeContents = () =>
	select( noticesStore )
		.getNotices()
		.map( ( { content } ) => content );

const waitForSaved = () =>
	waitFor( () => expect( noticeContents() ).toContain( 'Lead matching preferences saved.' ) );

beforeEach( () => {
	dispatch( noticesStore ).removeAllNotices( 'snackbar' );
} );

describe( '<AgencyPartnerDirectoryLeadMatchingPreferences>', () => {
	test( 'keeps real preferences saveable when the optional phone lookup fails', async () => {
		mockAgency();
		mockLeadMatching( {
			...completeProfile,
			contact: { phone: '+442012345678 ext 12', booking_link: '' },
		} );
		nock( API )
			.get( '/rest/v1.1/meta/sms-country-codes/' )
			.reply( 500, { code: 'error', message: 'Error' } );
		let savedProfile: AgencyLeadMatchingProfile | undefined;
		mockLeadMatchingSave( ( body ) => ( savedProfile = body ) );

		render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );
		expect(
			await screen.findByText( /phone number field is temporarily unavailable/ )
		).toBeVisible();
		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Booking link (optional)' } ),
			'booking.example.com/intro?source=A4A'
		);
		const serviceLevel = await screen.findByRole( 'combobox', {
			name: 'Which max service level are you most comfortable with right now?',
		} );
		await userEvent.selectOptions( serviceLevel, 'premium' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );
		await waitForSaved();
		expect( savedProfile ).toEqual( {
			...completeProfile,
			contact: {
				phone: '+442012345678 ext 12',
				booking_link: 'https://booking.example.com/intro?source=A4A',
			},
			service_and_budget: { ...completeProfile.service_and_budget, max_service_level: 'premium' },
		} );
	} );

	test( 'hydrates, saves contact-only edits on an incomplete profile, and clears them on reload', async () => {
		mockAgency();
		mockSmsCountryCodes();
		let savedProfile = getLeadMatchingProfile( getEmptyLeadMatchingFormData(), null, true );
		// GET returns a nullable completion flag and can return unset boolean answers.
		savedProfile.availability.profile_v2_complete = null;
		savedProfile.geography_and_language.global_remote = null;
		savedProfile.contact = {
			phone: '+14256559999 ext 12',
			booking_link: 'http://booking.example.com/?source=A4A',
		};
		nock( API )
			.get( '/wpcom/v2/agency/123/lead-matching' )
			.query( true )
			.reply( 200, () => ( { agency_id: 123, lead_matching_profile: savedProfile } ) )
			.persist();
		const scope = nock( API )
			.put( '/wpcom/v2/agency/123/lead-matching' )
			.query( true )
			.twice()
			.reply( 200, ( _uri, body ) => {
				savedProfile = body as AgencyLeadMatchingProfile;
				return { agency_id: 123, lead_matching_profile: savedProfile };
			} );

		let view = render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );
		let phone = await screen.findByRole( 'textbox', { name: 'Phone number (optional)' } );
		expect( phone ).toHaveValue( savedProfile.contact.phone );
		expect( screen.getByRole( 'textbox', { name: 'Booking link (optional)' } ) ).toHaveValue(
			savedProfile.contact.booking_link
		);
		await userEvent.clear( phone );
		await userEvent.type( phone, '(425) 655-1234 ext 9' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );
		await waitForSaved();
		expect( savedProfile.contact.phone ).toBe( '+14256551234 ext 9' );
		expect( savedProfile.availability.profile_v2_complete ).toBe( false );
		expect( savedProfile.geography_and_language.global_remote ).toBe( false );
		view.unmount();

		view = render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );
		phone = await screen.findByRole( 'textbox', { name: 'Phone number (optional)' } );
		expect( phone ).toHaveValue( '+14256551234 ext 9' );
		await userEvent.clear( phone );
		await userEvent.clear( screen.getByRole( 'textbox', { name: 'Booking link (optional)' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( savedProfile.contact ).toEqual( { phone: '', booking_link: '' } );
		view.unmount();
		render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );
		expect( await screen.findByRole( 'textbox', { name: 'Phone number (optional)' } ) ).toHaveValue(
			''
		);
		expect( screen.getByRole( 'textbox', { name: 'Booking link (optional)' } ) ).toHaveValue( '' );
	} );

	test( 'saves a changed availability on the public profile only', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );
		mockSmsCountryCodes();

		let isAvailable: unknown;
		const profileScope = mockProfileSave(
			( body ) => ( isAvailable = body.profile_listing_is_available )
		);
		const leadMatchingScope = mockLeadMatchingSave();

		render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: 'Accepting new clients' } )
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );

		await waitForSaved();
		expect( profileScope.isDone() ).toBe( true );
		expect( isAvailable ).toBe( false );
		expect( leadMatchingScope.isDone() ).toBe( false );
	} );

	test( 'saves the availability first, then the answers with it', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );
		mockSmsCountryCodes();

		const requests: string[] = [];
		let savedProfile: AgencyLeadMatchingProfile | undefined;
		const profileScope = mockProfileSave( () => requests.push( 'profile' ) );
		const leadMatchingScope = mockLeadMatchingSave( ( body ) => {
			requests.push( 'lead-matching' );
			savedProfile = body;
		} );

		render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: 'Accepting new clients' } )
		);
		await userEvent.selectOptions(
			screen.getByRole( 'combobox', { name: 'What is your minimum budget? (optional)' } ),
			'3k_10k'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );

		await waitForSaved();
		expect( profileScope.isDone() ).toBe( true );
		expect( leadMatchingScope.isDone() ).toBe( true );
		expect( requests ).toEqual( [ 'profile', 'lead-matching' ] );
		expect( savedProfile?.availability.accepting_work ).toBe( false );
		expect( savedProfile?.service_and_budget.minimum_budget_band ).toBe( '3k_10k' );
	} );

	test( 'does not save the answers when the availability fails to save', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );
		mockSmsCountryCodes();
		const profileScope = nock( API )
			.put( '/wpcom/v2/agency/123/profile' )
			.query( true )
			.reply( 500, { code: 'error', message: 'Error' } );
		const leadMatchingScope = mockLeadMatchingSave();

		render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );

		await userEvent.click(
			await screen.findByRole( 'checkbox', { name: 'Accepting new clients' } )
		);
		await userEvent.selectOptions(
			screen.getByRole( 'combobox', { name: 'What is your minimum budget? (optional)' } ),
			'3k_10k'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );

		await waitFor( () => expect( noticeContents() ).toContain( 'Failed to save availability.' ) );
		expect( profileScope.isDone() ).toBe( true );
		expect( leadMatchingScope.isDone() ).toBe( false );
	} );

	test( 'retains invalid contacts and failed sync edits without reporting success', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );
		mockSmsCountryCodes();
		nock( API )
			.put( '/wpcom/v2/agency/123/lead-matching' )
			.query( true )
			.reply( 200, {
				agency_id: 123,
				lead_matching_profile: completeProfile,
				sync: { status: 'failed' },
			} );

		render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );

		const phone = await screen.findByRole( 'textbox', { name: 'Phone number (optional)' } );
		const booking = screen.getByRole( 'textbox', { name: 'Booking link (optional)' } );
		await userEvent.type( phone, '+44abc1234' );
		await userEvent.type( booking, 'http:booking.example.com' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );
		expect( booking ).toHaveAttribute( 'aria-invalid', 'true' );
		expect( phone ).toHaveValue( '+44abc1234' );
		expect( noticeContents() ).not.toContain( 'Lead matching preferences saved.' );
		await userEvent.clear( phone );
		await userEvent.type( phone, '+1234' );
		await userEvent.clear( booking );
		await userEvent.type( booking, 'book.example.com/?a=1' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );

		await waitFor( () =>
			expect( noticeContents() ).toContain( 'Failed to save lead matching preferences.' )
		);
		expect( phone ).toHaveValue( '+1234' );
		expect( booking ).toHaveValue( 'https://book.example.com/?a=1' );
		expect( noticeContents() ).not.toContain( 'Lead matching preferences saved.' );
	} );
} );
