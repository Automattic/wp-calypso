/**
 * @jest-environment jsdom
 */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { render } from '../../../../test-utils';
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
	test( 'keeps booking and real preferences usable while the phone lookup loads or fails', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );
		let failSmsLookup = () => {};
		const smsLookup = nock( API )
			.get( '/rest/v1.1/meta/sms-country-codes/' )
			.reply( ( _uri, _body, callback ) => {
				failSmsLookup = () => callback( null, [ 500, { code: 'error', message: 'Error' } ] );
			} );
		let savedProfile: AgencyLeadMatchingProfile | undefined;
		const save = mockLeadMatchingSave( ( body ) => ( savedProfile = body ) );

		render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );
		const serviceLevel = await screen.findByRole( 'combobox', {
			name: 'Which max service level are you most comfortable with right now?',
		} );
		const booking = screen.getByRole( 'textbox', { name: 'Booking link (optional)' } );
		await userEvent.type( booking, 'not a URL' );
		expect( smsLookup.isDone() ).toBe( true );
		await act( async () => failSmsLookup() );
		expect(
			await screen.findByText(
				'The phone number field is temporarily unavailable. You can still save your preferences.'
			)
		).toBeVisible();
		expect( booking ).toHaveValue( 'not a URL' );
		expect(
			screen.getByText(
				'Design preview: These contact details are not saved. Other profile fields save as usual.'
			)
		).toBeVisible();

		await userEvent.selectOptions( serviceLevel, 'premium' );
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );
		await waitForSaved();
		expect( save.isDone() ).toBe( true );
		expect( savedProfile ).toEqual( {
			...completeProfile,
			service_and_budget: { ...completeProfile.service_and_budget, max_service_level: 'premium' },
		} );
	} );

	test( 'saves every answer without persisting or validating local contact drafts', async () => {
		mockAgency();
		mockLeadMatching( completeProfile );
		mockSmsCountryCodes();

		let savedProfile: AgencyLeadMatchingProfile | undefined;
		const scope = mockLeadMatchingSave( ( body ) => ( savedProfile = body ) );

		const view = render( <AgencyPartnerDirectoryLeadMatchingPreferences /> );
		expect( await screen.findByRole( 'combobox', { name: 'Country code' } ) ).toHaveValue(
			'United States (+1)'
		);
		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Phone number (optional)' } ),
			'not a phone'
		);
		await userEvent.type(
			screen.getByRole( 'textbox', { name: 'Booking link (optional)' } ),
			'not a URL'
		);
		expect( scope.isDone() ).toBe( false );

		await userEvent.selectOptions(
			await screen.findByRole( 'combobox', {
				name: 'Which max service level are you most comfortable with right now?',
			} ),
			'premium'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );

		await waitForSaved();
		expect( scope.isDone() ).toBe( true );
		expect( savedProfile ).toEqual( {
			...completeProfile,
			service_and_budget: { ...completeProfile.service_and_budget, max_service_level: 'premium' },
		} );

		view.unmount();
		render( <AgencyPartnerDirectoryLeadMatchingPreferences />, { queryClient: view.queryClient } );
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

	test( 'reports a failed sync as an error', async () => {
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

		await userEvent.selectOptions(
			await screen.findByRole( 'combobox', { name: 'What is your minimum budget? (optional)' } ),
			'3k_10k'
		);
		await userEvent.click( screen.getByRole( 'button', { name: 'Save preferences' } ) );

		await waitFor( () =>
			expect( noticeContents() ).toContain( 'Failed to save lead matching preferences.' )
		);
	} );
} );
