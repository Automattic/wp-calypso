/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

jest.mock( 'i18n-calypso', () => ( {
	localize: ( component: unknown ) => component,
	translate: ( text: string ) => text,
	useTranslate: () => ( text: string, options?: { components?: { a?: ReactNode } } ) => {
		const { cloneElement } = jest.requireActual( 'react' );
		return options?.components?.a
			? cloneElement( options.components.a, {}, 'Compare providers' )
			: text;
	},
} ) );

jest.mock( 'calypso/lib/domains', () => ( {
	canCurrentUserAddEmail: jest.fn( ( domain ) => !! domain?.currentUserCanAddEmail ),
	getCurrentUserCannotAddEmailReason: jest.fn( ( domain ) =>
		domain && ! domain.currentUserCanAddEmail ? domain.currentUserCannotAddEmailReason : null
	),
	getSelectedDomain: jest.fn( ( { domains, selectedDomainName } ) =>
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
	BillingIntervalToggle: ( {
		onIntervalChange,
	}: {
		onIntervalChange: ( interval: string ) => void;
	} ) => <button onClick={ () => onIntervalChange( 'monthly' ) }>Billing interval</button>,
} ) );
jest.mock( 'calypso/my-sites/email/email-providers-comparison/email-forwarding-link', () => () => (
	<div>Email forwarding link</div>
) );
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/email-upsell-navigation',
	() =>
		( { backUrl, skipUrl }: { backUrl: string; skipUrl?: string } ) => (
			<nav>
				<a href={ backUrl }>Back</a>
				{ skipUrl && <a href={ skipUrl }>Skip</a> }
			</nav>
		)
);
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/google-workspace-card',
	() =>
		( { canSkip = true }: { canSkip?: boolean } ) => (
			<div>Google Workspace card{ canSkip && <button>Skip Google Workspace</button> }</div>
		)
);
jest.mock(
	'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/professional-email-card',
	() =>
		( { canSkip = true }: { canSkip?: boolean } ) => (
			<div>Professional Email card{ canSkip && <button>Skip Professional Email</button> }</div>
		)
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

const renderComparison = ( domain = nonOwnerDomainWithoutForwards, isDomainInCart = false ) => {
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
			isDomainInCart={ isDomainInCart }
			selectedDomainName="example.com"
			source="email"
		/>
	);
};

describe( 'EmailProvidersStackedComparison', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/' );
	} );

	afterEach( () => {
		jest.clearAllMocks();
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

	it( 'hides navigation and provider Skip actions for an email-intent domain purchase', () => {
		window.history.replaceState( {}, '', '/?emailIntent=true' );
		renderComparison( nonOwnerDomainWithoutForwards, true );

		expect( screen.queryByRole( 'link', { name: 'Skip' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Skip/ } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Back' } ) ).toHaveAttribute(
			'href',
			'/domains/add/example.wordpress.com?emailIntent=true'
		);
	} );

	it( 'keeps Skip for ordinary domain purchases', () => {
		renderComparison( nonOwnerDomainWithoutForwards, true );

		expect( screen.getByRole( 'link', { name: 'Skip' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Skip Google Workspace' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Skip Professional Email' } ) ).toBeVisible();
	} );

	it( 'preserves email intent when changing the billing interval', async () => {
		window.history.replaceState( {}, '', '/?emailIntent=true' );
		renderComparison( nonOwnerDomainWithoutForwards, true );
		await userEvent.click( screen.getByRole( 'button', { name: 'Billing interval' } ) );

		expect( page ).toHaveBeenLastCalledWith( expect.stringContaining( 'emailIntent=true' ) );
		expect( page ).toHaveBeenLastCalledWith( expect.stringContaining( 'interval=monthly' ) );
	} );

	it( 'preserves email intent when opening the comparison page', () => {
		window.history.replaceState( {}, '', '/?emailIntent=true' );
		renderComparison( nonOwnerDomainWithoutForwards, true );
		const target = new URL(
			screen.getByRole( 'link', { name: 'Compare providers' } ).getAttribute( 'href' ) ?? '',
			window.location.origin
		);
		expect( target.searchParams.get( 'emailIntent' ) ).toBe( 'true' );
	} );
} );
