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

test( 'renders a non-dismissible error notice with a contact action', () => {
	render(
		<EmailBlockNotice
			site={ createSite( {
				status: 'blocked',
				reason: 'Too many bounces, sender blocked',
				expires_on: '2026-09-01 00:00:00',
			} ) }
		/>
	);

	expect( screen.getByText( 'Your site can’t send email' ) ).toBeVisible();
	expect( screen.getByRole( 'button', { name: 'Contact us' } ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: 'Dismiss' } ) ).not.toBeInTheDocument();
} );
