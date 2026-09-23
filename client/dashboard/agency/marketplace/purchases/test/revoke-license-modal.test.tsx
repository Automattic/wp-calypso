/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import RevokeLicenseModal from '../revoke-license-modal';
import type { Agency, JetpackLicense } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

const baseLicense: JetpackLicense = {
	license_id: 1,
	license_key: 'jetpack-backup-t1_abc',
	product_id: 1,
	product: 'Jetpack VaultPress Backup',
	user_id: null,
	username: null,
	blog_id: null,
	siteurl: null,
	has_downloads: true,
	issued_at: '2026-01-01 00:00:00',
	attached_at: null,
	revoked_at: null,
	owner_type: 'jetpack_partner_key',
	quantity: null,
	parent_license_id: null,
	meta: null,
	referral: null,
};

function mockRevoke( status = 200 ) {
	return nock( API ).delete( '/wpcom/v2/agency/license' ).reply( status, {} );
}

function captureSurvey() {
	const body: { value?: unknown } = {};
	const scope = nock( API )
		.post( '/wpcom/v2/marketing/survey', ( posted ) => {
			body.value = posted;
			return true;
		} )
		.reply( 200, { success: true, err: null } );
	return { body, scope };
}

function renderModal( license: JetpackLicense ) {
	const closeModal = jest.fn();
	const queryClient = new QueryClient();
	queryClient.setQueryData( activeAgencyQuery().queryKey, { id: AGENCY_ID } as Agency );
	queryClient.setQueryData( agencyProductsQuery( AGENCY_ID ).queryKey, [] );
	render( <RevokeLicenseModal license={ license } closeModal={ closeModal } />, { queryClient } );
	return { closeModal };
}

describe( '<RevokeLicenseModal> churn feedback', () => {
	beforeEach( () => nock.cleanAll() );

	test( 'does not revoke until a reason is picked', async () => {
		const user = userEvent.setup();
		renderModal( baseLicense );

		const revoke = screen.getByRole( 'button', { name: 'Revoke license' } );
		expect( revoke ).toBeDisabled();

		await user.click( screen.getByRole( 'checkbox', { name: 'It was the wrong product' } ) );
		expect( revoke ).toBeEnabled();
	} );

	test( 'files the churn survey once the license is revoked', async () => {
		const user = userEvent.setup();
		mockRevoke();
		const { body } = captureSurvey();
		const { closeModal } = renderModal( { ...baseLicense, referral: { id: 1 } } );

		await user.click( screen.getByRole( 'checkbox', { name: 'It was the wrong product' } ) );
		await user.click( screen.getByRole( 'checkbox', { name: 'I was just trying it out' } ) );
		await user.type(
			screen.getByRole( 'textbox', { name: 'Anything else we should know?' } ),
			'Too pricey'
		);
		await user.click( screen.getByRole( 'button', { name: 'Revoke license' } ) );

		await waitFor( () => expect( closeModal ).toHaveBeenCalled() );
		await waitFor( () => expect( body.value ).toBeDefined() );
		expect( body.value ).toEqual( {
			site_id: AGENCY_ID,
			survey_id: 'license-cancel-product',
			survey_responses: {
				comment: { text: 'Too pricey' },
				suggestions: { text: 'it-was-the-wrong-product, i-was-just-trying-it-out' },
				cta: 'cancel',
				meta: {
					product_name: 'Jetpack VaultPress Backup',
					license_key: 'jetpack-backup-t1_abc',
					license_type: 'client',
				},
			},
		} );
	} );

	test( 'does not file the survey when the revoke fails', async () => {
		const user = userEvent.setup();
		const revoke = mockRevoke( 500 );
		const { scope } = captureSurvey();
		const { closeModal } = renderModal( baseLicense );

		await user.click( screen.getByRole( 'checkbox', { name: 'It was the wrong product' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Revoke license' } ) );

		await waitFor( () => expect( revoke.isDone() ).toBe( true ) );
		await waitFor( () =>
			expect( screen.getByRole( 'button', { name: 'Revoke license' } ) ).toBeEnabled()
		);
		expect( scope.isDone() ).toBe( false );
		expect( closeModal ).not.toHaveBeenCalled();
	} );

	test( 'files a hosting survey for a Pressable plan after the second confirmation', async () => {
		const user = userEvent.setup();
		mockRevoke();
		const { body } = captureSurvey();
		renderModal( { ...baseLicense, license_key: 'pressable-wp-1_abc', product: 'Pressable' } );

		await user.click( screen.getByRole( 'checkbox', { name: 'My client no longer needs it' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Revoke license' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Revoke Pressable plan license' } ) );

		await waitFor( () => expect( body.value ).toBeDefined() );
		expect( body.value ).toMatchObject( {
			survey_id: 'license-cancel-hosting',
			survey_responses: {
				suggestions: { text: 'my-client-no-longer-needs-it' },
				meta: { license_type: 'agency' },
			},
		} );
	} );
} );
