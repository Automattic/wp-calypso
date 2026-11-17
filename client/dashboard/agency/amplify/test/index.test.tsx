/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import AgencyAmplify from '../index';
import type { AmplifyReport, AmplifyUsage } from '@automattic/api-core';

const API = 'https://public-api.wordpress.com';
const AGENCY_ID = 7;

const report = {
	id: '1',
	status: 'completed',
	url: 'https://oliveandember.example',
	mode: 'full',
	created_at: '2026-10-30T12:00:00+00:00',
	updated_at: '2026-10-30T12:20:00+00:00',
	score: { human: 71, ai: 64 },
	has_pdf: true,
	archived: false,
	failure_reason: null,
} as AmplifyReport;

function mockAgency() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [
			{
				id: AGENCY_ID,
				approval_status: 'approved',
				tier: { id: 'agency-partner' },
				user: { role: 'a4a_administrator', capabilities: [] },
			},
		] );
}

function mockReports( reports: AmplifyReport[], usage: Partial< AmplifyUsage > = {} ) {
	nock( API )
		.get( `/wpcom/v2/agency/${ AGENCY_ID }/amplify/reports` )
		.query( true )
		.reply( 200, {
			reports,
			usage: { used: 3, limit: 15, resets_at: '2026-11-01T00:00:00Z', ...usage },
		} );
}

function mockSites() {
	nock( API )
		.get( '/wpcom/v2/jetpack-agency/sites' )
		.query( true )
		.reply( 200, { sites: [], total: 0 } )
		.persist();
}

describe( '<AgencyAmplify>', () => {
	// jsdom has no Web Animations API, which the score preview uses when the report type changes.
	const originalAnimate = Element.prototype.animate;
	beforeAll( () => {
		Element.prototype.animate = vi.fn(
			() => ( { cancel: vi.fn(), onfinish: null } ) as unknown as Animation
		);
	} );
	afterAll( () => {
		Element.prototype.animate = originalAnimate;
	} );

	beforeEach( () => {
		mockAgency();
		mockSites();
	} );

	test( 'shows the overview and the reports left to a new agency', async () => {
		mockReports( [] );

		render( <AgencyAmplify /> );

		expect(
			await screen.findByRole( 'heading', {
				name: 'Turn a prospect’s homepage into your next winning pitch',
			} )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Create report' } ) ).toBeVisible();
		expect( await screen.findByText( '12 reports left this month' ) ).toBeVisible();
	} );

	test( 'moves between report types with the arrow keys', async () => {
		mockReports( [] );
		const user = userEvent.setup();

		render( <AgencyAmplify /> );

		const full = await screen.findByRole( 'radio', { name: /^Full report/ } );
		expect( full ).toHaveAttribute( 'aria-checked', 'true' );
		expect( screen.getByRole( 'radio', { name: /^People/ } ) ).toHaveAttribute( 'tabindex', '-1' );

		full.focus();
		await user.keyboard( '{ArrowDown}' );

		const people = screen.getByRole( 'radio', { name: /^People/ } );
		expect( people ).toHaveAttribute( 'aria-checked', 'true' );
		expect( people ).toHaveFocus();

		await user.keyboard( '{End}' );
		expect( screen.getByRole( 'radio', { name: /^AI agents/ } ) ).toHaveFocus();

		await user.keyboard( '{ArrowDown}' );
		expect( screen.getByRole( 'radio', { name: /^Full report/ } ) ).toHaveFocus();
	} );

	test( 'lists reports with the monthly usage', async () => {
		mockReports( [ report ] );

		render( <AgencyAmplify /> );

		expect( await screen.findByText( '3 of 15 reports' ) ).toBeVisible();
		expect( screen.getByRole( 'meter', { name: 'Reports used this month' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'New report' } ) ).toBeEnabled();
	} );

	test( 'stops new reports once the monthly allowance is used up', async () => {
		mockReports( [ report ], { used: 15 } );

		render( <AgencyAmplify /> );

		expect( await screen.findByText( 'You’ve used all 15 reports this month' ) ).toBeVisible();
		// Disabled but still focusable, so its tooltip can explain why.
		expect( screen.getByRole( 'button', { name: 'New report' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	test( 'shows no allowance to an agency without a monthly limit', async () => {
		mockReports( [ report ], { used: 80, limit: null } );

		render( <AgencyAmplify /> );

		expect( await screen.findByRole( 'button', { name: 'New report' } ) ).toBeEnabled();
		expect( screen.queryByRole( 'meter' ) ).not.toBeInTheDocument();
	} );

	test( 'offers a retry when the reports fail to load', async () => {
		nock( API )
			.get( `/wpcom/v2/agency/${ AGENCY_ID }/amplify/reports` )
			.query( true )
			.reply( 500, { code: 'internal_error', message: 'Error' } );

		render( <AgencyAmplify /> );

		expect( await screen.findByRole( 'alert' ) ).toHaveTextContent(
			'Unable to load reports. Please try again.'
		);
		expect( screen.getByRole( 'button', { name: 'Retry' } ) ).toBeVisible();
	} );
} );
