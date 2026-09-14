/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import { EmailBlockNotice, getEmailBlock } from '../email-block-notice';
import type { Site } from '@automattic/api-core';

function createSite( atomic_email_block: Site[ 'atomic_email_block' ] ) {
	// Only the fields the notice actually reads.
	return { ID: 123, URL: 'https://example.wordpress.com', atomic_email_block } as unknown as Site;
}

describe( 'getEmailBlock', () => {
	test( 'returns null when the field is absent or null', () => {
		expect( getEmailBlock( createSite( undefined ) ) ).toBeNull();
		expect( getEmailBlock( createSite( null ) ) ).toBeNull();
	} );

	test( 'returns the block when the site is blocked', () => {
		const block = {
			status: 'blocked' as const,
			reason: 'Too many bounces, sender blocked',
			expires_on: '2026-09-01 00:00:00',
		};
		expect( getEmailBlock( createSite( block ) ) ).toEqual( block );
	} );
} );

const blockedSite = createSite( {
	status: 'blocked',
	reason: 'Too many bounces, sender blocked',
	expires_on: '2026-09-01 00:00:00',
} );

test( 'records one impression when the notice is shown', () => {
	const { recordTracksEvent } = render( <EmailBlockNotice site={ blockedSite } /> );

	expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
	expect( recordTracksEvent ).toHaveBeenCalledWith(
		'calypso_dashboard_email_block_notice_impression',
		{ site_id: 123 }
	);
} );

test( 'renders a non-dismissible error notice with a contact action', () => {
	render( <EmailBlockNotice site={ blockedSite } /> );

	expect( screen.getByText( 'Your site can’t send email' ) ).toBeVisible();
	expect( screen.getByRole( 'button', { name: 'Contact us' } ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
} );
