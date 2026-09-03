/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED } from 'calypso/lib/emails/email-provider-constants';
import EmailForwardingLink from '../index';
import type { ResponseDomain } from 'calypso/lib/domains/types';

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/selectors/get-current-route', () => jest.fn( () => '/current-route' ) );

jest.mock( 'calypso/state/sites/domains/selectors', () => ( {
	getDomainsBySiteId: jest.fn( () => [] ),
} ) );

jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: jest.fn( () => ( { ID: 1, slug: 'example.com' } ) ),
} ) );

jest.mock( 'calypso/lib/domains', () => ( {
	getCurrentUserCannotAddEmailReason: jest.fn( ( domain: ResponseDomain | undefined ) =>
		domain && ! domain.currentUserCanAddEmail ? domain.currentUserCannotAddEmailReason : null
	),
	getSelectedDomain: jest.fn(),
} ) );

jest.mock( 'calypso/lib/domains/email-forwarding', () => ( {
	hasEmailForwards: jest.fn( () => false ),
} ) );

jest.mock( 'calypso/my-sites/email/paths', () => ( {
	getAddEmailForwardsPath: jest.fn( () => '/add-email-forwards' ),
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
		jest.clearAllMocks();
		( hasEmailForwards as jest.Mock ).mockReturnValue( false );
	} );

	it( 'renders the email forwarding promo for a regular domain without forwards', () => {
		( getSelectedDomain as jest.Mock ).mockReturnValue( regularDomain );

		render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( screen.getByText( promoMatcher ) ).toBeVisible();
	} );

	// Regression: DOMENG-453 - Gravatar domains cannot use free email forwarding.
	it( 'renders nothing for a Gravatar domain', () => {
		( getSelectedDomain as jest.Mock ).mockReturnValue( { isGravatarDomain: true } );

		const { container } = render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when there is no selected domain', () => {
		( getSelectedDomain as jest.Mock ).mockReturnValue( undefined );

		const { container } = render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when the domain already has email forwards', () => {
		( getSelectedDomain as jest.Mock ).mockReturnValue( regularDomain );
		( hasEmailForwards as jest.Mock ).mockReturnValue( true );

		render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( screen.queryByText( promoMatcher ) ).not.toBeInTheDocument();
	} );

	it( 'renders nothing when forwarding itself is restricted', () => {
		( getSelectedDomain as jest.Mock ).mockReturnValue( domainStateRestrictedDomain );

		const { container } = render( <EmailForwardingLink selectedDomainName="example.com" /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
