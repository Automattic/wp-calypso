/**
 * @jest-environment jsdom
 */
import { GoogleWorkspaceSlugs, TitanMailSlugs } from '@automattic/api-core';
import { domainQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { waitFor, within } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { useDomainFromUrlParam } from '../../hooks/use-domain-from-url-param';
import ChooseEmailSolution from '../index';
import type { Domain, User } from '@automattic/api-core';

jest.mock( '../../hooks/use-domain-from-url-param' );

jest.mock( '../../../app/router/emails', () => ( {
	addMailboxRoute: { to: '/emails/add-mailbox/$domain/$provider/$interval' },
	chooseEmailSolutionRoute: { useSearch: () => ( {} ) },
} ) );

const DOMAIN_NAME = 'example.com';
const SITE_ID = 123;
const user = {
	ID: 1,
	username: 'domainowner',
	is_valid_google_apps_country: true,
} as User;

function useDomainForTest() {
	const { data: domain, isFetched, isLoading } = useSuspenseQuery( domainQuery( DOMAIN_NAME ) );
	return {
		domain,
		domainName: DOMAIN_NAME,
		isDomainFetched: isFetched,
		isLoadingDomain: isLoading,
		site: undefined,
	};
}

function mockApi( overrides: Partial< Domain > = {} ) {
	const domainRequest = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.2/domain-details/${ DOMAIN_NAME }` )
		.query( true )
		.reply( 200, {
			domain: DOMAIN_NAME,
			blog_id: SITE_ID,
			subtype: { id: 'domain_registration', label: 'Domain registration' },
			owner: user.username,
			current_user_is_owner: true,
			current_user_can_add_email: false,
			current_user_cannot_add_email_reason: {
				errors: { 'domain-expired': [ 'Email cannot be purchased for an expired domain.' ] },
			},
			expired: true,
			has_wpcom_nameservers: true,
			google_apps_subscription: null,
			titan_mail_subscription: null,
			...overrides,
		} );

	const productsRequest = nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ SITE_ID }/products` )
		.query( true )
		.reply( 200, {
			[ TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG ]: {
				product_slug: TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG,
				cost: 60,
				currency_code: 'USD',
			},
			[ GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY ]: {
				product_slug: GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
				cost: 72,
				currency_code: 'USD',
			},
		} );

	return { domainRequest, productsRequest };
}

describe( '<ChooseEmailSolution>', () => {
	beforeEach( () => {
		jest.spyOn( config, 'isEnabled' ).mockReturnValue( false );
		jest.mocked( useDomainFromUrlParam ).mockImplementation( useDomainForTest );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	test( 'explains expiration to the owner while keeping email purchases disabled', async () => {
		const { productsRequest } = mockApi();
		const { container } = render( <ChooseEmailSolution />, { user } );
		const view = within( container );

		expect( await view.findByText( /because the domain has expired/ ) ).toBeVisible();
		expect( view.getByRole( 'button', { name: 'Get Professional Email' } ) ).toBeDisabled();
		expect( view.getByRole( 'button', { name: 'Get Google Workspace' } ) ).toBeDisabled();
		expect(
			view.queryByRole( 'link', { name: /log in with the account/ } )
		).not.toBeInTheDocument();
		await waitFor( () => expect( productsRequest.isDone() ).toBe( true ) );
	} );

	test( 'keeps email purchases available for an eligible active owner', async () => {
		mockApi( {
			current_user_can_add_email: true,
			current_user_cannot_add_email_reason: null,
			expired: false,
		} );
		const { container } = render( <ChooseEmailSolution />, { user } );
		const view = within( container );

		expect( await view.findByText( '60' ) ).toBeVisible();
		expect( view.getByRole( 'button', { name: 'Get Professional Email' } ) ).toBeEnabled();
		expect( view.getByRole( 'button', { name: 'Get Google Workspace' } ) ).toBeEnabled();
		expect( view.queryByText( /because the domain has expired/ ) ).not.toBeInTheDocument();
		expect( view.queryByRole( 'link', { name: /contact support/ } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the add-mailbox redirect for an expired domain with an eligible email subscription', async () => {
		const { productsRequest } = mockApi( {
			current_user_can_add_email: true,
			current_user_cannot_add_email_reason: null,
			titan_mail_subscription: {
				status: 'active',
				product_slug: TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG,
				expiry_date: '2099-01-01',
				order_id: 123,
				maximum_mailbox_count: 1,
			},
		} );
		const { router, container } = render( <ChooseEmailSolution />, { user } );
		const view = within( container );
		const navigate = jest.spyOn( router, 'navigate' ).mockResolvedValue( undefined );

		await waitFor( () =>
			expect( navigate ).toHaveBeenCalledWith(
				expect.objectContaining( {
					to: '/emails/add-mailbox/$domain/$provider/$interval',
					params: { domain: DOMAIN_NAME, provider: 'titan', interval: 'annually' },
					search: { tier: undefined },
				} )
			)
		);
		expect( view.queryByText( /because the domain has expired/ ) ).not.toBeInTheDocument();
		expect( view.queryByRole( 'link', { name: /contact support/ } ) ).not.toBeInTheDocument();
		await waitFor( () => expect( productsRequest.isDone() ).toBe( true ) );
	} );
} );
