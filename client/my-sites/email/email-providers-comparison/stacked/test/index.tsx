/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import {
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
} from 'calypso/lib/emails/email-provider-constants';
import { useDispatch, useSelector } from 'calypso/state';
import EmailProvidersStackedComparison from '..';
import type { ResponseDomain } from 'calypso/lib/domains/types';
import type { ReactNode } from 'react';

jest.mock( '@automattic/calypso-products', () => ( {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY: 'google-workspace-business-starter-monthly',
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY: 'google-workspace-business-starter-yearly',
} ) );

jest.mock( '@automattic/calypso-router', () => jest.fn() );

jest.mock( '@wordpress/url', () => ( {
	addQueryArgs: jest.fn( ( url ) => url ),
	getQueryArgs: jest.fn( () => ( {} ) ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	localize: ( component: unknown ) => component,
	translate: ( text: string ) => text,
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/lib/domains', () => ( {
	canCurrentUserAddEmail: jest.fn( ( domain ) => !! domain?.currentUserCanAddEmail ),
	getCurrentUserCannotAddEmailReason: jest.fn( ( domain ) =>
		domain && ! domain.currentUserCanAddEmail ? domain.currentUserCannotAddEmailReason : null
	),
	getSelectedDomain: jest.fn(
		( { domains, selectedDomainName } ) =>
			domains?.find( ( domain: ResponseDomain ) => domain.name === selectedDomainName )
	),
} ) );

jest.mock( 'calypso/components/data/query-products-list', () => () => null );
jest.mock( 'calypso/components/data/query-site-domains', () => () => null );
jest.mock( 'calypso/components/data/query-site-products', () => () => null );
jest.mock( 'calypso/components/gsuite/gsuite-price', () => ( {
	hasDiscount: jest.fn( () => false ),
} ) );
jest.mock( 'calypso/components/main', () => ( { children }: { children: ReactNode } ) => (
	<main>{ children }</main>
) );
jest.mock( 'calypso/layout/body-section-css-class', () => () => null );
jest.mock( 'calypso/lib/analytics/track-component-view', () => () => null );
jest.mock( 'calypso/my-sites/email/email-domain-state-restricted-message', () => ( {
	EmailDomainStateRestrictedMessage: () => <div>Domain restricted</div>,
} ) );
jest.mock( 'calypso/my-sites/email/email-existing-forwards-notice', () => () => null );
jest.mock( 'calypso/my-sites/email/email-existing-paid-service-notice', () => () => null );
jest.mock( 'calypso/my-sites/email/email-non-domain-owner-message', () => ( {
	EmailNonDomainOwnerMessage: () => <div>Email service can only be purchased</div>,
} ) );
jest.mock( 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle', () => ( {
	BillingIntervalToggle: () => <div>Billing interval</div>,
} ) );
jest.mock( 'calypso/my-sites/email/email-providers-comparison/email-forwarding-link', () => () => (
	<div>Email forwarding link</div>
) );
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/email-upsell-navigation',
	() => () => null
);
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/google-workspace-card',
	() => () => <div>Google Workspace card</div>
);
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/professional-email-card',
	() => () => <div>Professional Email card</div>
);
jest.mock( 'calypso/state', () => ( {
	useDispatch: jest.fn(),
	useSelector: jest.fn(),
} ) );
jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( ( eventName, eventProperties ) => ( {
		eventName,
		eventProperties,
		type: 'TRACKS_EVENT',
	} ) ),
} ) );
jest.mock( 'calypso/state/products-list/selectors', () => ( {
	getProductBySlug: jest.fn( ( state ) => state.gSuiteProduct ),
} ) );
jest.mock( 'calypso/state/selectors/can-user-purchase-gsuite', () =>
	jest.fn( ( state ) => state.canPurchaseGSuite )
);
jest.mock( 'calypso/state/selectors/get-current-route', () =>
	jest.fn( ( state ) => state.currentRoute )
);
jest.mock( 'calypso/state/sites/domains/selectors', () => ( {
	getDomainsBySiteId: jest.fn( ( state ) => state.domains ),
	hasLoadedSiteDomains: jest.fn( ( state ) => state.hasLoadedDomains ),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSite: jest.fn( ( state ) => state.selectedSite ),
} ) );

const selectedSite = {
	ID: 123,
	slug: 'example.wordpress.com',
};

const domainWithoutForwards = {
	name: 'example.com',
	domain: 'example.com',
	emailForwardsCount: 0,
	currentUserCanAddEmail: true,
	currentUserCannotAddEmailReason: null,
	googleAppsSubscription: null,
	titanMailSubscription: null,
} as ResponseDomain;

const domainRestrictedBy = ( code: string | null ) =>
	( {
		...domainWithoutForwards,
		currentUserCanAddEmail: false,
		currentUserCannotAddEmailReason: code
			? { code, message: 'Email is unavailable for this domain.' }
			: null,
	} ) as ResponseDomain;

const nonOwnerDomainWithoutForwards = domainRestrictedBy(
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION
);

const renderComparison = ( domain = nonOwnerDomainWithoutForwards ) => {
	const state = {
		canPurchaseGSuite: false,
		currentRoute: '/email/example.com/purchase/example.wordpress.com',
		domains: [ domain ],
		gSuiteProduct: {},
		hasLoadedDomains: true,
		selectedSite,
	};

	( useDispatch as jest.Mock ).mockReturnValue( jest.fn() );
	( useSelector as jest.Mock ).mockImplementation( ( selector ) => selector( state ) );

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
		jest.clearAllMocks();
	} );

	it( 'keeps paid email disabled while showing the free forwarding link to site admins', () => {
		renderComparison();

		expect( screen.getByText( 'Email service can only be purchased' ) ).toBeVisible();
		expect( screen.queryByText( 'Billing interval' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Email forwarding link' ) ).toBeVisible();
	} );

	it( 'shows the forwarding link when the user can add email', () => {
		renderComparison( domainWithoutForwards );

		expect( screen.getByText( 'Email forwarding link' ) ).toBeVisible();
	} );

	it.each( [ EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL, 'domain-expired', null ] )(
		'hides the forwarding link when email is unavailable because of %s',
		( code ) => {
			renderComparison( domainRestrictedBy( code ) );

			expect( screen.queryByText( 'Email forwarding link' ) ).not.toBeInTheDocument();
		}
	);
} );
