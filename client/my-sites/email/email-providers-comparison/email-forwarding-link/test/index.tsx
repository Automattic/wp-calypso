/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED } from 'calypso/lib/emails/email-provider-constants';
import EmailForwardingLink from '../index';
import type { ResponseDomain } from 'calypso/lib/domains/types';

vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useTranslate: () => ( text: string ) => text,
	} )
);

vi.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

vi.mock( 'calypso/state/selectors/get-current-route', () => ( {
	default: vi.fn( () => '/current-route' ),
} ) );

vi.mock( 'calypso/state/sites/domains/selectors', () => ( {
	getDomainsBySiteId: vi.fn( () => [] ),
} ) );

vi.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: vi.fn( () => ( { ID: 1, slug: 'example.com' } ) ),
} ) );

vi.mock( 'calypso/lib/domains', () => ( {
	getCurrentUserCannotAddEmailReason: vi.fn( ( domain: ResponseDomain | undefined ) =>
		domain && ! domain.currentUserCanAddEmail ? domain.currentUserCannotAddEmailReason : null
	),
	getSelectedDomain: vi.fn(),
} ) );

vi.mock( 'calypso/lib/domains/email-forwarding', () => ( {
	hasEmailForwards: vi.fn( () => false ),
} ) );

vi.mock( 'calypso/my-sites/email/paths', () => ( {
	getAddEmailForwardsPath: vi.fn( () => '/add-email-forwards' ),
} ) );

const promoMatcher = /Looking for a free email solution/i;

const regularDomain = {
	isGravatarDomain: false,
	currentUserCanAddEmail: true,
	currentUserCannotAddEmailReason: null,
} as ResponseDomain;

const domainStateRestrictedDomain = {
	...regularDomain,
	currentUserCanAddEmail: false,
	currentUserCannotAddEmailReason: {
		code: EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
		message: 'Email is unavailable for this domain.',
	},
} as ResponseDomain;

describe( 'EmailForwardingLink', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		( hasEmailForwards as Mock ).mockReturnValue( false );
	} );

	it( 'renders the email forwarding promo for a regular domain without forwards', () => {
		( getSelectedDomain as Mock ).mockReturnValue( regularDomain );

		render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( screen.getByText( promoMatcher ) ).toBeVisible();
	} );

	// Regression: DOMENG-453 - Gravatar domains cannot use free email forwarding.
	it( 'renders nothing for a Gravatar domain', () => {
		( getSelectedDomain as Mock ).mockReturnValue( { isGravatarDomain: true } );

		const { container } = render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when there is no selected domain', () => {
		( getSelectedDomain as Mock ).mockReturnValue( undefined );

		const { container } = render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when the domain already has email forwards', () => {
		( getSelectedDomain as Mock ).mockReturnValue( regularDomain );
		( hasEmailForwards as Mock ).mockReturnValue( true );

		render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( screen.queryByText( promoMatcher ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing when forwarding itself is restricted', () => {
		( getSelectedDomain as Mock ).mockReturnValue( domainStateRestrictedDomain );

		const { container } = render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
