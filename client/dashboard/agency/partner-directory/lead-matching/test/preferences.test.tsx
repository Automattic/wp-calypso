/**
 * @jest-environment jsdom
 */
import { agencyLeadMatchingQuery, queryClient } from '@automattic/api-queries';
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
import type { AgencyLeadMatchingProfile, AgencyLeadMatchingResponse } from '@automattic/api-core';

const noticeContents = () =>
	select( noticesStore )
		.getNotices()
		.map( ( { content } ) => content );

const waitForSaved = () =>
	waitFor( () => expect( noticeContents() ).toContain( 'Lead matching preferences saved.' ) );

beforeEach( () => {
	dispatch( noticesStore ).removeAllNotices( 'snackbar' );
	window.history.replaceState( null, '', '/' );
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
		const user = userEvent.setup();
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
		expect( phone ).toHaveValue( '4256559999 ext 12' );
		expect( screen.getByRole( 'textbox', { name: 'Booking link (optional)' } ) ).toHaveValue(
			savedProfile.contact.booking_link
		);
		await user.clear( phone );
		await user.paste( '+34 911 234 567 ext 9' );
		expect( phone ).toHaveValue( '911234567 ext 9' );
		expect( screen.getByRole( 'combobox', { name: 'Country code' } ) ).toHaveValue( 'Spain (+34)' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );
		await waitForSaved();
		expect( savedProfile.contact?.phone ).toBe( '+34911234567 ext 9' );
		expect( savedProfile.availability.profile_v2_complete ).toBe( false );
		expect( savedProfile.geography_and_language.global_remote ).toBe( false );
		view.unmount();

		view = render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );
		phone = await screen.findByRole( 'textbox', { name: 'Phone number (optional)' } );
		expect( phone ).toHaveValue( '911234567 ext 9' );
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

	test( 'saves preferences while retaining skipped contacts and failed sync edits without reporting full success', async () => {
		const user = userEvent.setup();
		mockAgency();
		const profile = {
			...completeProfile,
			contact: { phone: '+14256559999 ext 12', booking_link: 'https://book.example.com' },
		};
		mockLeadMatching( profile );
		mockSmsCountryCodes();
		const partialScope = nock( API )
			.put( '/wpcom/v2/agency/123/lead-matching', ( body ) => {
				expect( body.contact ).toEqual( {
					phone: '+44abc1234',
					booking_link: 'https://not a URL',
				} );
				expect( body.service_and_budget.max_service_level ).toBe( 'premium' );
				expect( body.geography_and_language ).toEqual( profile.geography_and_language );
				return true;
			} )
			.query( true )
			.reply( 200, ( _uri, body ) => ( {
				agency_id: 123,
				lead_matching_profile: { ...( body as AgencyLeadMatchingProfile ), contact: {} },
				ignored_contact_fields: [ 'phone', 'booking_link' ],
			} ) );
		nock( API )
			.put( '/wpcom/v2/agency/123/lead-matching' )
			.query( true )
			.reply( 200, {
				agency_id: 123,
				lead_matching_profile: completeProfile,
				sync: { status: 'failed' },
			} );

		const view = render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );

		const phone = await screen.findByRole( 'textbox', { name: 'Phone number (optional)' } );
		const booking = screen.getByRole( 'textbox', { name: 'Booking link (optional)' } );
		await user.clear( phone );
		await user.paste( '+44abc1234' );
		await user.clear( booking );
		await user.paste( 'not a URL' );
		const serviceLevel = screen.getByRole( 'combobox', {
			name: 'Which max service level are you most comfortable with right now?',
		} );
		await user.selectOptions( serviceLevel, 'premium' );
		await user.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );
		await waitFor( () =>
			expect( noticeContents() ).toContain(
				'Preferences saved, but these contact fields were not saved: Phone number, Booking link. Check them and try again.'
			)
		);
		expect( partialScope.isDone() ).toBe( true );
		expect( booking ).toHaveAttribute( 'aria-invalid', 'true' );
		expect( phone ).toHaveValue( '+44abc1234' );
		expect( booking ).toHaveValue( 'https://not a URL' );
		expect( serviceLevel ).toHaveValue( 'premium' );
		expect( view.router.state.location.pathname ).toBe( '/' );
		const saved = queryClient.getQueryData< AgencyLeadMatchingResponse >(
			agencyLeadMatchingQuery( 123 ).queryKey
		);
		expect( saved?.lead_matching_profile?.contact ).toEqual( profile.contact );
		expect( saved?.lead_matching_profile?.service_and_budget.max_service_level ).toBe( 'premium' );
		expect( noticeContents() ).not.toContain( 'Lead matching preferences saved.' );
		await user.clear( phone );
		await user.paste( '+1234' );
		await user.clear( booking );
		await user.paste( 'book.example.com/?a=1' );
		await user.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );

		await waitFor( () =>
			expect( noticeContents() ).toContain( 'Failed to save lead matching preferences.' )
		);
		expect( phone ).toHaveValue( '234' );
		expect( booking ).toHaveValue( 'https://book.example.com/?a=1' );
		expect( noticeContents() ).not.toContain( 'Lead matching preferences saved.' );
	} );
} );
