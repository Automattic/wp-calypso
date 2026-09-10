/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../../test-utils';
import AgencySitesNeedSetup from '../index';
import type { PendingAgencySite, ReferralApiResponse } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';

function pendingSite(
	id: number,
	{
		state = 'pending',
		licenseKey = `license-${ id }`,
		referral,
	}: { state?: string; licenseKey?: string; referral?: ReferralApiResponse } = {}
): PendingAgencySite {
	return { id, features: { wpcom_atomic: { state, license_key: licenseKey, referral } } };
}

function mockAgencyAndPendingSites( pendingSites: PendingAgencySite[] ) {
	nock( API )
		.persist()
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 1 } ] );
	nock( API ).persist().get( '/wpcom/v2/agency/1/sites/pending' ).reply( 200, pendingSites );
}

describe( '<AgencySitesNeedSetup>', () => {
	afterEach( () => nock.cleanAll() );

	test( 'collapses the licenses the agency owns into one row with a create button', async () => {
		mockAgencyAndPendingSites( [ pendingSite( 1 ), pendingSite( 2 ) ] );

		render( <AgencySitesNeedSetup /> );

		expect( await screen.findByText( '2 sites available' ) ).toBeVisible();
		expect( screen.getByText( 'WordPress.com' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create new site' } ) ).toBeVisible();
	} );

	test( 'lists a referred license on its own row naming the owner', async () => {
		const referral = { client: { email: 'client@example.com' } } as ReferralApiResponse;
		mockAgencyAndPendingSites( [ pendingSite( 1, { referral } ), pendingSite( 2 ) ] );

		render( <AgencySitesNeedSetup /> );

		expect( await screen.findByText( /client@example.com/ ) ).toBeVisible();
		expect( screen.getByText( '1 site available' ) ).toBeVisible();
	} );

	test( 'ignores licenses whose site is already being created', async () => {
		mockAgencyAndPendingSites( [ pendingSite( 1, { state: 'provisioning' } ), pendingSite( 2 ) ] );

		render( <AgencySitesNeedSetup /> );

		expect( await screen.findByText( '1 site available' ) ).toBeVisible();
	} );

	test( 'ignores rows without a license key', async () => {
		mockAgencyAndPendingSites( [ pendingSite( 1, { licenseKey: '' } ), pendingSite( 2 ) ] );

		render( <AgencySitesNeedSetup /> );

		expect( await screen.findByText( '1 site available' ) ).toBeVisible();
	} );
} );
