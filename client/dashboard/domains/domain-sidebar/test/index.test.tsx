/**
 * @vitest-environment jsdom
 */
import { DomainSubtype } from '@automattic/api-core';
import { domainQuery, siteByIdQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	Outlet,
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	useRouterState,
} from '@tanstack/react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AnalyticsProvider } from '../../../app/analytics';
import { APP_CONTEXT_DEFAULT_CONFIG, AppProvider } from '../../../app/context';
import { setTransientQueryParamsAtPathname } from '../../../app/transient-query-params';
import { useActions } from '../../dataviews/actions';
import DomainSidebar, { DomainEmailsBackButton } from '../index';
import type { DomainSummary, Site } from '@automattic/api-core';

vi.mock( '../../../app/router/domains', async () => {
	const { useParams } =
		await vi.importActual< typeof import( '@tanstack/react-router' ) >( '@tanstack/react-router' );
	return {
		domainRoute: { useParams: () => useParams( { strict: false } ) },
		domainOverviewRoute: { fullPath: '/domains/$domainName' },
		domainTransferRoute: { fullPath: '/domains/$domainName/transfer' },
	};
} );
vi.mock( '../../../app/router/sites', () => ( {
	siteOverviewRoute: { fullPath: '/sites/$siteSlug' },
	siteDomainsRoute: { fullPath: '/sites/$siteSlug/domains' },
} ) );
vi.mock( '../../../app/router/emails', () => ( { emailsRoute: { fullPath: '/emails' } } ) );
vi.mock( '../domain-switcher-item', () => ( { default: () => null } ) );

const domain = {
	domain: 'example.com',
	blog_id: 123,
	site_slug: 'domain-slug.wordpress.com',
	subtype: { id: DomainSubtype.DOMAIN_REGISTRATION, label: 'Registration' },
} as DomainSummary;
const site = { ID: 123, slug: 'site-slug.com' } as Site;

function ViewSettings( { siteList }: { siteList?: Site } ) {
	const actions = useActions( { site: siteList, layout: 'table' } );
	const viewSettings = actions.find( ( { id } ) => id === 'manage-domain' ) as unknown as {
		callback: ( items: DomainSummary[] ) => void;
	};
	return <button onClick={ () => viewSettings.callback( [ domain ] ) }>View settings</button>;
}

function renderAt( url: string ) {
	const rootRoute = createRootRoute( {
		component: function Root() {
			const pathname = useRouterState( { select: ( state ) => state.location.pathname } );
			return (
				<>
					{ pathname.startsWith( '/domains/' ) ? (
						! pathname.endsWith( '/no-sidebar' ) && <DomainSidebar />
					) : (
						<DomainEmailsBackButton />
					) }
					<Outlet />
				</>
			);
		},
	} );
	const page = ( path: string, component: () => React.ReactNode = () => null ) =>
		createRoute( { getParentRoute: () => rootRoute, path, component } );
	const emailsRoute = page( 'emails', () => <Outlet /> );
	const emailsPage = ( path: string ) =>
		createRoute( { getParentRoute: () => emailsRoute, path, component: () => null } );
	const router = createRouter( {
		history: createMemoryHistory( { initialEntries: [ url ] } ),
		routeTree: rootRoute.addChildren( [
			page( 'domains', () => <ViewSettings /> ),
			page( 'domains/$domainName' ),
			page( 'domains/$domainName/dns' ),
			page( 'domains/$domainName/no-sidebar' ),
			page( 'sites/$siteSlug/domains', () => <ViewSettings siteList={ site } /> ),
			emailsRoute.addChildren( [
				emailsPage( '/' ),
				emailsPage( 'choose-domain' ),
				emailsPage( 'choose-email-solution/$domain' ),
			] ),
		] ),
	} );

	const queryClient = new QueryClient( { defaultOptions: { queries: { staleTime: Infinity } } } );
	queryClient.setQueryData( domainQuery( domain.domain ).queryKey, domain as never );
	queryClient.setQueryData( domainQuery( 'other.com' ).queryKey, {
		...domain,
		domain: 'other.com',
	} as never );
	queryClient.setQueryData( siteByIdQuery( site.ID ).queryKey, site );

	render(
		<QueryClientProvider client={ queryClient }>
			<AppProvider
				config={ {
					...APP_CONTEXT_DEFAULT_CONFIG,
					supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, emails: true },
				} }
			>
				<AnalyticsProvider client={ { recordTracksEvent: vi.fn(), recordPageView: vi.fn() } }>
					<RouterProvider router={ router } />
				</AnalyticsProvider>
			</AppProvider>
		</QueryClientProvider>
	);

	return ( to: string ) => act( () => router.history.push( to ) );
}

const findBackLink = ( name: string ) => screen.findByRole( 'link', { name } );

describe( 'DomainSidebar', () => {
	afterEach( () => setTransientQueryParamsAtPathname( '/domains/example.com', {} ) );

	test( 'goes back to the site, by its current slug, when opened from it', async () => {
		renderAt( '/domains/example.com?back_to=site-domains' );

		expect( await findBackLink( 'Back to site' ) ).toHaveAttribute(
			'href',
			'/sites/site-slug.com/domains'
		);
	} );

	test( 'goes back to Domains when opened without `back_to`', async () => {
		renderAt( '/domains/example.com' );

		expect( await findBackLink( 'Back to Domains' ) ).toHaveAttribute( 'href', '/domains' );
	} );

	test( 'keeps the origin on subpages and on returning to the overview without `back_to`', async () => {
		const goTo = renderAt( '/domains/example.com?back_to=site-domains' );
		await findBackLink( 'Back to site' );

		await goTo( '/domains/example.com/dns' );

		expect( await findBackLink( 'Back to site' ) ).toBeVisible();
		const overview = screen.getByRole( 'link', { name: 'Overview' } );
		expect( overview ).toHaveAttribute( 'href', '/domains/example.com?back_to=site-domains' );
		expect( overview ).toHaveAttribute( 'aria-current', 'page' );

		await goTo( '/domains/example.com' );

		expect( await findBackLink( 'Back to site' ) ).toBeVisible();
	} );

	test( 'keeps the origin when the sidebar remounts inside the domain', async () => {
		const goTo = renderAt( '/domains/example.com?back_to=site-domains' );
		await findBackLink( 'Back to site' );

		await goTo( '/domains/example.com/no-sidebar' );
		await waitFor( () => expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument() );
		await goTo( '/domains/example.com/dns' );

		expect( await findBackLink( 'Back to site' ) ).toBeVisible();
	} );

	test.each( [ '/sites/site-slug.com/domains', '/domains/other.com' ] )(
		'forgets the origin after going to %s',
		async ( destination ) => {
			const goTo = renderAt( '/domains/example.com?back_to=site-domains' );
			await findBackLink( 'Back to site' );

			await goTo( destination );
			await waitFor( () =>
				expect( screen.queryByRole( 'link', { name: 'Back to site' } ) ).not.toBeInTheDocument()
			);
			await goTo( '/domains/example.com/dns' );

			expect( await findBackLink( 'Back to Domains' ) ).toBeVisible();
		}
	);

	test( "links back to Domains from a domain's Emails screens", async () => {
		renderAt( '/domains/example.com' );

		await userEvent.click( await screen.findByRole( 'link', { name: 'Emails' } ) );

		expect( await findBackLink( 'Back to Domains' ) ).toHaveAttribute( 'href', '/domains' );
	} );

	test.each( [
		'/emails/choose-domain?domainName=example.com',
		'/emails/choose-email-solution/example.com',
	] )( 'shows "Back to Domains" on %s', async ( url ) => {
		renderAt( url );

		expect( await findBackLink( 'Back to Domains' ) ).toBeVisible();
	} );

	test.each( [ '/emails', '/emails/choose-domain' ] )(
		'hides "Back to Domains" on %s',
		async ( url ) => {
			const goTo = renderAt( '/emails/choose-domain?domainName=example.com' );
			await findBackLink( 'Back to Domains' );

			await goTo( url );

			await waitFor( () =>
				expect( screen.queryByRole( 'link', { name: 'Back to Domains' } ) ).not.toBeInTheDocument()
			);
		}
	);

	test.each( [
		[ '/sites/site-slug.com/domains', 'Back to site' ],
		[ '/domains', 'Back to Domains' ],
	] )( '"View settings" from %s shows "%s"', async ( url, backLabel ) => {
		renderAt( url );

		await userEvent.click( await screen.findByRole( 'button', { name: 'View settings' } ) );

		expect( await findBackLink( backLabel ) ).toBeVisible();
	} );
} );
