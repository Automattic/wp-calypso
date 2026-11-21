/**
 * @jest-environment jsdom
 */
import { CALYPSO_CONTACT } from '@automattic/urls';
import { render, screen } from '@testing-library/react';
import { useDomainOwnerUserName } from 'calypso/components/data/query-domain-owner-username';
import { EmailNonDomainOwnerMessage } from '../index';
import type { SiteDetails } from '@automattic/data-stores';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ComponentProps } from 'react';

jest.mock( 'calypso/components/data/query-domain-owner-username', () => ( {
	useDomainOwnerUserName: jest.fn(),
} ) );

jest.mock( 'calypso/lib/analytics/track-component-view', () => () => null );
jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const DOMAIN_NAME = 'example.com';
const OWNER = 'domainowner';
const selectedSite = { ID: 123, slug: 'example.wordpress.com' } as SiteDetails;
const expiredDomain = {
	name: DOMAIN_NAME,
	domain: DOMAIN_NAME,
	currentUserIsOwner: true,
	currentUserCanAddEmail: false,
	currentUserCannotAddEmailReason: {
		code: 'domain-expired',
		message: 'This domain has expired.',
	},
	expired: true,
	privacyAvailable: true,
} as ResponseDomain;

type MessageProps = ComponentProps< typeof EmailNonDomainOwnerMessage >;

function renderMessage(
	overrides: Partial< ResponseDomain > = {},
	props: Partial< MessageProps > = {}
) {
	return render(
		<EmailNonDomainOwnerMessage
			domain={ { ...expiredDomain, ...overrides } }
			selectedSite={ selectedSite }
			source="email-comparison"
			{ ...props }
		/>
	);
}

const messageContexts: Pick< MessageProps, 'source' | 'usePromoCard' >[] = [
	{ source: 'email-comparison', usePromoCard: true },
	{ source: 'email-comparison', usePromoCard: false },
	{ source: 'email-management', usePromoCard: true },
	{ source: 'email-management', usePromoCard: false },
];

describe( '<EmailNonDomainOwnerMessage>', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useDomainOwnerUserName ).mockReturnValue( OWNER );
	} );

	test.each( messageContexts )(
		'explains expiration for $source with usePromoCard=$usePromoCard',
		( props ) => {
			const { container } = renderMessage( {}, props );

			expect( screen.getByText( /Email services cannot be purchased for/ ) ).toHaveTextContent(
				`Email services cannot be purchased for ${ DOMAIN_NAME } because the domain has expired. Please contact support for help renewing it.`
			);
			expect( screen.getAllByRole( 'link' ) ).toHaveLength( 1 );
			expect( screen.getByRole( 'link', { name: 'contact support' } ) ).toHaveAttribute(
				'href',
				CALYPSO_CONTACT
			);
			expect( screen.queryByRole( 'link', { name: /log in|reach out/i } ) ).not.toBeInTheDocument();

			const wrapper = props.usePromoCard
				? '.email-non-domain-owner-message__promo-card'
				: 'p.email-non-domain-owner-message__text';
			expect( container.querySelector( wrapper ) ).toBeInTheDocument();
		}
	);

	test( 'uses the expiration reason even when the expired flag is false', () => {
		renderMessage( { expired: false } );

		expect( screen.getByText( /because the domain has expired/ ) ).toBeVisible();
		expect( screen.queryByText( /can only be purchased by/ ) ).not.toBeInTheDocument();
	} );

	test( 'explains expiration when the owner username is unavailable', () => {
		jest.mocked( useDomainOwnerUserName ).mockReturnValue( '' );

		renderMessage();

		expect( screen.getByText( /because the domain has expired/ ) ).toHaveTextContent( DOMAIN_NAME );
		expect( screen.queryByText( /can only be purchased by the owner/ ) ).not.toBeInTheDocument();
		expect( screen.getAllByRole( 'link' ) ).toHaveLength( 1 );
	} );

	test.each( [ false, true ] )(
		'keeps ownership guidance for a non-owner when expired is %s',
		( expired ) => {
			renderMessage( { currentUserIsOwner: false, expired } );

			expect( screen.getByText( /Email service can only be purchased by/ ) ).toHaveTextContent(
				`Email service can only be purchased by ${ OWNER }, who is the owner of ${ DOMAIN_NAME }.`
			);
			const loginLink = screen.getByRole( 'link', { name: 'log in with the account' } );
			const loginUrl = new URL( loginLink.getAttribute( 'href' ) ?? '', 'https://wordpress.com' );
			expect( loginUrl.pathname ).toBe( '/log-in/' );
			expect( loginUrl.searchParams.get( 'email_address' ) ).toBe( OWNER );
			expect( loginUrl.searchParams.get( 'redirect_to' ) ).toBe(
				`/email/${ DOMAIN_NAME }/purchase/${ selectedSite.slug }?source=login-redirect`
			);
			expect( screen.getByRole( 'link', { name: `reach out to ${ OWNER }` } ) ).toHaveAttribute(
				'href',
				`https://privatewho.is/?s=${ DOMAIN_NAME }`
			);
			expect( screen.getByRole( 'link', { name: 'contact support' } ) ).toHaveAttribute(
				'href',
				CALYPSO_CONTACT
			);
			expect( screen.queryByText( /because the domain has expired/ ) ).not.toBeInTheDocument();
		}
	);

	test.each( [ 'domain-state-restricted', 'other-user-owns-email' ] )(
		'keeps the existing message for an expired owner blocked by %s',
		( code ) => {
			renderMessage( {
				currentUserCannotAddEmailReason: { code, message: 'Email is unavailable.' },
			} );

			expect( screen.getByRole( 'link', { name: 'log in with the account' } ) ).toBeVisible();
			expect( screen.queryByText( /because the domain has expired/ ) ).not.toBeInTheDocument();
		}
	);
} );
