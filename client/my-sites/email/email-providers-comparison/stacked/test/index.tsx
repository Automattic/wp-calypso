/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import {
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
} from 'calypso/lib/emails/email-provider-constants';
import { useDispatch, useSelector } from 'calypso/state';
import EmailProvidersStackedComparison from '..';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ReactNode } from 'react';

vi.mock( '@automattic/calypso-products', () => ( {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY: 'google-workspace-business-starter-monthly',
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY: 'google-workspace-business-starter-yearly',
} ) );

vi.mock( '@automattic/calypso-router', () => ( { default: vi.fn() } ) );

vi.mock( '@wordpress/url', () => ( {
	addQueryArgs: vi.fn( ( url ) => url ),
	getQueryArgs: vi.fn( () => ( {} ) ),
} ) );

vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		localize: ( component: unknown ) => component,
		translate: ( text: string ) => text,
		useTranslate: () => ( text: string ) => text,
	} )
);

vi.mock( 'calypso/lib/domains', () => ( {
	canCurrentUserAddEmail: vi.fn( ( domain ) => !! domain?.currentUserCanAddEmail ),
	getCurrentUserCannotAddEmailReason: vi.fn( ( domain ) =>
		domain && ! domain.currentUserCanAddEmail ? domain.currentUserCannotAddEmailReason : null
	),
	getSelectedDomain: vi.fn( ( { domains, selectedDomainName } ) =>
		domains?.find( ( domain: ResponseDomain ) => domain.name === selectedDomainName )
	),
} ) );

vi.mock( 'calypso/components/data/query-products-list', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/data/query-site-domains', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/data/query-site-products', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/gsuite/gsuite-price', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		hasDiscount: vi.fn( () => false ),
	} )
);
vi.mock( 'calypso/components/main', () => ( {
	default: ( { children }: { children: ReactNode } ) => <main>{ children }</main>,
} ) );
vi.mock( 'calypso/layout/body-section-css-class', () => ( { default: () => null } ) );
vi.mock( 'calypso/lib/analytics/track-component-view', () => ( { default: () => null } ) );
vi.mock( 'calypso/my-sites/email/email-domain-state-restricted-message', () => ( {
	EmailDomainStateRestrictedMessage: () => <div>Domain restricted</div>,
} ) );
vi.mock( 'calypso/my-sites/email/email-existing-forwards-notice', () => ( {
	default: () => null,
} ) );
vi.mock( 'calypso/my-sites/email/email-existing-paid-service-notice', () => ( {
	default: () => null,
} ) );
vi.mock( 'calypso/my-sites/email/email-non-domain-owner-message', () => ( {
	EmailNonDomainOwnerMessage: () => <div>Email service can only be purchased</div>,
} ) );
vi.mock( 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle', () => ( {
	BillingIntervalToggle: () => <div>Billing interval</div>,
} ) );
vi.mock( 'calypso/my-sites/email/email-providers-comparison/email-forwarding-link', () => ( {
	default: () => <div>Email forwarding link</div>,
} ) );
vi.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/email-upsell-navigation',
	() => ( { default: () => null } )
);
vi.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/google-workspace-card',
	() => ( { default: () => <div>Google Workspace card</div> } )
);
vi.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/professional-email-card',
	() => ( { default: () => <div>Professional Email card</div> } )
);
vi.mock( 'calypso/state', () => ( {
	useDispatch: vi.fn(),
	useSelector: vi.fn(),
} ) );
vi.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: vi.fn( ( eventName, eventProperties ) => ( {
		eventName,
		eventProperties,
		type: 'TRACKS_EVENT',
	} ) ),
} ) );
vi.mock( 'calypso/state/products-list/selectors', () => ( {
	getProductBySlug: vi.fn( ( state ) => state.gSuiteProduct ),
} ) );
vi.mock( 'calypso/state/selectors/can-user-purchase-gsuite', () => ( {
	default: vi.fn( ( state ) => state.canPurchaseGSuite ),
} ) );
vi.mock( 'calypso/state/selectors/get-current-route', () => ( {
	default: vi.fn( ( state ) => state.currentRoute ),
} ) );
vi.mock( 'calypso/state/sites/domains/selectors', () => ( {
	getDomainsBySiteId: vi.fn( ( state ) => state.domains ),
	hasLoadedSiteDomains: vi.fn( ( state ) => state.hasLoadedDomains ),
} ) );
vi.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: vi.fn( ( state ) => state.selectedSite ),
} ) );

const selectedSite = {
	ID: 123,
	slug: 'example.wordpress.com',
};

const nonOwnerDomainWithoutForwards = {
	name: 'example.com',
	domain: 'example.com',
	emailForwardsCount: 0,
	currentUserCanAddEmail: false,
	currentUserCannotAddEmailReason: {
		code: EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
		message: 'Only the domain owner can purchase email.',
	},
	googleAppsSubscription: null,
	titanMailSubscription: null,
} as ResponseDomain;

const renderComparison = ( domain = nonOwnerDomainWithoutForwards ) => {
	const state = {
		canPurchaseGSuite: false,
		currentRoute: '/email/example.com/purchase/example.wordpress.com',
		domains: [ domain ],
		gSuiteProduct: {},
		hasLoadedDomains: true,
		selectedSite,
	};

	( useDispatch as Mock ).mockReturnValue( vi.fn() );
	( useSelector as Mock ).mockImplementation( ( selector ) => selector( state ) );

	return render(
		<EmailProvidersStackedComparison
			comparisonContext="email-home-selected-domain"
			selectedDomainName="example.com"
			source="email"
		/>
	);
};

describe( 'EmailProvidersStackedComparison', () => {
	afterEach( () => {
		vi.clearAllMocks();
	} );

	it( 'keeps paid email disabled while showing the free forwarding link to site admins', () => {
		renderComparison();

		expect( screen.getByText( 'Email service can only be purchased' ) ).toBeVisible();
		expect( screen.queryByText( 'Billing interval' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Email forwarding link' ) ).toBeVisible();
	} );

	// Domain ownership is the only paid-email blocker this page treats as still forwardable.
	// Anything else, including reasons it doesn't recognize, has to stay hidden.
	it( 'hides the forwarding link for any other reason email is unavailable', () => {
		renderComparison( {
			...nonOwnerDomainWithoutForwards,
			currentUserCannotAddEmailReason: {
				code: EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
				message: 'Another user owns the email subscription.',
			},
		} as ResponseDomain );

		expect( screen.queryByText( 'Email forwarding link' ) ).not.toBeInTheDocument();
	} );
} );
