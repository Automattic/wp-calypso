/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import CertificationDevToolsSection from '../dev-tools-section';

const API = 'https://public-api.wordpress.com';

function mockAgencyWithCode() {
	nock( API )
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 1, approval_status: 'approved', tier: { id: 'agency-partner' } } ] );
	nock( API )
		.get( '/wpcom/v2/agency/1/apwd-discount-code' )
		.reply( 200, { code: 'HUBSPOT-CODE-123', discount_percent: '20' } );
}

describe( '<CertificationDevToolsSection>', () => {
	const originalClipboard = window.navigator.clipboard;

	beforeEach( () => {
		Object.defineProperty( window.navigator, 'clipboard', {
			value: { writeText: jest.fn().mockResolvedValue( undefined ) },
			configurable: true,
		} );
	} );

	afterEach( () => {
		nock.cleanAll();
		Object.defineProperty( window.navigator, 'clipboard', {
			value: originalClipboard,
			configurable: true,
		} );
	} );

	test( 'records a view, code copies, exam clicks and tier link clicks', async () => {
		const recordTracksEvent = jest.fn();
		mockAgencyWithCode();
		render(
			<CertificationDevToolsSection
				tiersHref="/agency-tier#certification"
				recordTracksEvent={ recordTracksEvent }
			/>
		);

		await userEvent.click( await screen.findByRole( 'button', { name: 'Copy Discount code' } ) );
		await userEvent.click( screen.getByRole( 'link', { name: /Sign up for the exam/ } ) );
		const tiersLink = screen.getByRole( 'link', { name: 'See every tier’s discount' } );
		expect( tiersLink ).toHaveAttribute( 'href', '/agency-tier#certification' );
		await userEvent.click( tiersLink );

		const source = { source: 'dev_tools' };
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_certification_view', source );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_certification_code_copy',
			source
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_certification_exam_click',
			source
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_certification_tiers_link_click',
			source
		);
	} );
} );
