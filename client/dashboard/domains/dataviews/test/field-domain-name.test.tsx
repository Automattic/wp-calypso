/**
 * @jest-environment jsdom
 */
import { DomainStatus, DomainSubtype } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { AnalyticsProvider } from '../../../app/analytics';
import { createDomainsRoutes } from '../../../app/router/domains';
import { rootRoute } from '../../../app/router/root';
import { DomainNameField } from '../field-domain-name';
import type { DomainSummary } from '@automattic/api-core';

// The `domainOverviewRoute`/`domainTransferRoute` singletons only get their
// `fullPath` populated once a router builds the real route tree. Build it once
// here so the field's `to={ route.fullPath }` resolves to a real template.
beforeAll( () => {
	createRouter( { routeTree: rootRoute.addChildren( createDomainsRoutes() ) } );
} );

const getMockedDomain = ( customProps: Partial< DomainSummary > = {} ): DomainSummary =>
	( {
		domain: 'example.com',
		site_slug: 'example.wordpress.com',
		blog_id: 123,
		subscription_id: 'sub123',
		subtype: { id: DomainSubtype.DOMAIN_TRANSFER, label: 'Transfer' },
		domain_status: {
			id: DomainStatus.TRANSFER_PENDING,
			label: 'Pending transfer',
			type: 'neutral',
		},
		...customProps,
	} ) as DomainSummary;

// The shared test-utils router only registers a root route, so TanStack `Link`
// can't interpolate the `/domains/$domainName[/transfer]` route templates and
// falls back to `/`. Register both destinations here so the built href reflects
// which route the field actually points at.
function renderField( domain: DomainSummary ) {
	const fieldRoute = createRootRoute( {
		component: () => (
			<AnalyticsProvider client={ { recordTracksEvent: jest.fn(), recordPageView: jest.fn() } }>
				<DomainNameField domain={ domain } value={ domain.domain } />
			</AnalyticsProvider>
		),
	} );
	const overviewRoute = createRoute( {
		getParentRoute: () => fieldRoute,
		path: 'domains/$domainName',
		component: () => null,
	} );
	const transferRoute = createRoute( {
		getParentRoute: () => fieldRoute,
		path: 'domains/$domainName/transfer',
		component: () => null,
	} );
	const router = createRouter( {
		routeTree: fieldRoute.addChildren( [ overviewRoute, transferRoute ] ),
	} );

	return render(
		<QueryClientProvider client={ new QueryClient() }>
			<RouterProvider router={ router } />
		</QueryClientProvider>
	);
}

describe( '<DomainNameField>', () => {
	afterEach( () => {
		config.disable( 'domain-transfer-redesign' );
	} );

	test( 'links a pending transfer to the transfer management route', async () => {
		config.enable( 'domain-transfer-redesign' );

		renderField( getMockedDomain() );

		expect( await screen.findByRole( 'link' ) ).toHaveAttribute(
			'href',
			'/domains/example.com/transfer'
		);
	} );

	test( 'links a failed transfer to the domain overview route', async () => {
		config.enable( 'domain-transfer-redesign' );

		renderField(
			getMockedDomain( {
				domain_status: {
					id: DomainStatus.TRANSFER_ERROR,
					label: 'Transfer failed',
					type: 'error',
				},
			} )
		);

		expect( await screen.findByRole( 'link' ) ).toHaveAttribute( 'href', '/domains/example.com' );
	} );

	test( 'links to the domain overview route when the transfer redesign is disabled', async () => {
		renderField( getMockedDomain() );

		expect( await screen.findByRole( 'link' ) ).toHaveAttribute( 'href', '/domains/example.com' );
	} );

	test( 'links a non-transfer domain to the domain overview route even with the transfer redesign enabled', async () => {
		config.enable( 'domain-transfer-redesign' );

		renderField(
			getMockedDomain( {
				subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
			} )
		);

		expect( await screen.findByRole( 'link' ) ).toHaveAttribute( 'href', '/domains/example.com' );
	} );

	test( 'renders the domain name without a link when there is no subscription', async () => {
		renderField( getMockedDomain( { subscription_id: undefined } ) );

		expect( await screen.findByText( 'example.com' ) ).toBeVisible();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );
} );
