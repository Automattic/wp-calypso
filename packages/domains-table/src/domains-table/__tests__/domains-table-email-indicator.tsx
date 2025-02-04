/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { testFullDomain } from '../../test-utils';
import { DomainsTableEmailIndicator } from '../domains-table-email-indicator';

const siteSlug = 'test-domain.com';

test( 'when its a domain with google mailboxes, display its count and a link to manage it', () => {
	render(
		<DomainsTableEmailIndicator
			siteSlug={ siteSlug }
			domain={ testFullDomain( {
				google_apps_subscription: {
					status: 'active',
					total_user_count: 3,
					is_eligible_for_introductory_offer: false,
				},
			} ) }
		/>
	);

	const emailCount = screen.queryByText( '3 mailboxes' );

	expect( emailCount ).toBeInTheDocument();
	expect( emailCount ).toHaveAttribute( 'href', '/email/example.com/manage/test-domain.com' );
} );

test( 'when its a domain with titan mailboxes, display its count and a link to manage it', () => {
	let subscriptionStatus = 'active';

	const { rerender } = render(
		<DomainsTableEmailIndicator
			siteSlug={ siteSlug }
			domain={ testFullDomain( {
				titan_mail_subscription: {
					status: subscriptionStatus,
					is_eligible_for_introductory_offer: false,
					maximum_mailbox_count: 3,
				},
			} ) }
		/>
	);

	let emailCount = screen.queryByText( '3 mailboxes' );

	expect( emailCount ).toBeInTheDocument();
	expect( emailCount ).toHaveAttribute( 'href', '/email/example.com/manage/test-domain.com' );

	subscriptionStatus = 'suspended';

	rerender(
		<DomainsTableEmailIndicator
			siteSlug={ siteSlug }
			domain={ testFullDomain( {
				titan_mail_subscription: {
					status: subscriptionStatus,
					is_eligible_for_introductory_offer: false,
					maximum_mailbox_count: 3,
				},
			} ) }
		/>
	);

	emailCount = screen.queryByText( '3 mailboxes' );

	expect( emailCount ).toBeInTheDocument();
	expect( emailCount ).toHaveAttribute( 'href', '/email/example.com/manage/test-domain.com' );
} );

test( 'when its a domain with email forwards, display its count and a link to manage it', () => {
	render(
		<DomainsTableEmailIndicator
			siteSlug={ siteSlug }
			domain={ testFullDomain( {
				email_forwards_count: 3,
			} ) }
		/>
	);

	const emailCount = screen.queryByText( '3 forwards' );

	expect( emailCount ).toBeInTheDocument();
	expect( emailCount ).toHaveAttribute( 'href', '/email/example.com/manage/test-domain.com' );
} );

test( 'when there are no mailboxes and the user is the owner of the site, display the link to add one', () => {
	render(
		<DomainsTableEmailIndicator
			siteSlug={ siteSlug }
			domain={ testFullDomain( {
				current_user_can_add_email: true,
			} ) }
		/>
	);

	const emailCount = screen.queryByText( '+ Add email' );

	expect( emailCount ).toBeInTheDocument();
	expect( emailCount ).toHaveAttribute( 'href', '/email/example.com/manage/test-domain.com' );
} );

test( 'when there are no mailboxes and the user is not the owner of the site, display the no action dash', () => {
	render(
		<DomainsTableEmailIndicator
			siteSlug={ siteSlug }
			domain={ testFullDomain( {
				current_user_can_add_email: false,
			} ) }
		/>
	);

	expect( screen.queryByText( '+ Add email' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( '-' ) ).toBeInTheDocument();
} );

test( 'when the domain is not a mapping or something registered in wpcom, display the no action dash', () => {
	render(
		<DomainsTableEmailIndicator
			siteSlug={ siteSlug }
			domain={ testFullDomain( {
				type: 'transfer',
			} ) }
		/>
	);

	expect( screen.queryByText( '+ Add email' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( '-' ) ).toBeInTheDocument();
} );
