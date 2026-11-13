import { domainQuery, siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useRouterState, useSearch } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, envelope } from '@wordpress/icons';
import { useEffect } from 'react';
import { useAppContext } from '../../app/context';
import { domainRoute } from '../../app/router/domains';
import { emailsIndexRoute, emailsRoute } from '../../app/router/emails';
import {
	getSnackbarBackButtonNavigateOptions,
	type SnackbarBackTo,
} from '../../app/snackbar-back-button';
import {
	getTransientQueryParamsAtPathname,
	setTransientQueryParamsAtPathname,
} from '../../app/transient-query-params';
import { SidebarBackButton, SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import DomainSwitcherItem from './domain-switcher-item';
import type { AnyRouteMatch } from '@tanstack/react-router';

// Not a pathname, so breadcrumbs ignore it.
const EMAILS_ORIGIN_KEY = 'domain-sidebar-emails-origin';

function getOriginDomainName() {
	return getTransientQueryParamsAtPathname( EMAILS_ORIGIN_KEY )?.domainName as string | undefined;
}

function forgetOriginDomain( domainName: string ) {
	setTransientQueryParamsAtPathname( `/domains/${ domainName }`, {} );
	setTransientQueryParamsAtPathname( EMAILS_ORIGIN_KEY, {} );
}

// An Emails screen for the origin domain, or one naming no domain other than the unfiltered list.
function isOriginDomainEmailsMatch( { routeId, params, search }: AnyRouteMatch ) {
	const originDomainName = getOriginDomainName();
	if ( ! originDomainName || ! routeId.startsWith( `${ emailsRoute.fullPath }/` ) ) {
		return false;
	}
	const domainName = params.domain ?? search.domainName;
	return domainName ? domainName === originDomainName : routeId !== emailsIndexRoute.id;
}

export function DomainEmailsBackButton() {
	const router = useRouter();
	const location = useRouterState( { select: ( state ) => state.location } );
	// `state.matches` lags during pending navigations.
	const match = router.matchRoutes( location ).at( -1 );
	const originDomainName = getOriginDomainName();
	const isOriginMatch = !! match && isOriginDomainEmailsMatch( match );

	useEffect( () => {
		if ( originDomainName && ! isOriginMatch ) {
			forgetOriginDomain( originDomainName );
		}
	}, [ originDomainName, isOriginMatch ] );

	if ( ! originDomainName || ! isOriginMatch ) {
		return null;
	}

	return (
		<SidebarBackButton to={ `/domains/${ originDomainName }` }>
			{ __( 'Back to domain' ) }
		</SidebarBackButton>
	);
}

export default function DomainSidebar() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useQuery( domainQuery( domainName ) );
	const router = useRouter();
	const overviewPath = `/domains/${ domainName }`;
	const { back_to: backToParam } = useSearch( { strict: false } ) as {
		back_to?: SnackbarBackTo;
	};

	// Subpages have no `back_to` in the URL, so it's remembered while the user stays in the domain.
	const backTo =
		backToParam ??
		( getTransientQueryParamsAtPathname( overviewPath )?.back_to as SnackbarBackTo | undefined );

	const { data: site } = useQuery( {
		...siteByIdQuery( domain?.blog_id ?? 0 ),
		enabled: !! backTo && !! domain,
	} );

	useEffect( () => {
		if ( backToParam ) {
			setTransientQueryParamsAtPathname( overviewPath, { back_to: backToParam } );
		}
	}, [ overviewPath, backToParam ] );

	// Keep the origin while the user stays in the domain or its Emails screens.
	useEffect( () => {
		setTransientQueryParamsAtPathname( EMAILS_ORIGIN_KEY, { domainName } );
		return () => {
			// `state.matches` lags during pending navigations.
			const matches = router.matchRoutes( router.state.location );
			const match = matches[ matches.length - 1 ];
			if (
				match?.params.domainName !== domainName &&
				! ( match && isOriginDomainEmailsMatch( match ) )
			) {
				forgetOriginDomain( domainName );
			}
		};
	}, [ router, domainName ] );

	if ( ! domain ) {
		return null;
	}

	const backToSite = getSnackbarBackButtonNavigateOptions( backTo, {
		siteSlug: site?.slug ?? domain.site_slug,
	} );

	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to={ backToSite ? router.buildLocation( backToSite ).href : '/domains' }>
				{ backToSite ? __( 'Back to site' ) : __( 'Back to Domains' ) }
			</SidebarBackButton>
			<VStack spacing={ 4 }>
				<DomainSwitcherItem domain={ domain } />
				<DomainMenuSidebar
					domainName={ domainName }
					overviewSearch={ backToSite && backTo ? { back_to: backTo } : undefined }
				/>
			</VStack>
		</VStack>
	);
}

function DomainMenuSidebar( {
	domainName,
	overviewSearch,
}: {
	domainName: string;
	overviewSearch?: Record< string, string >;
} ) {
	const { supports } = useAppContext();

	return (
		<SidebarMenu>
			<SidebarMenuItem
				icon={ category }
				to={ `/domains/${ domainName }` }
				search={ overviewSearch }
				activeOptions={ { includeSearch: false } }
			>
				{ __( 'Overview' ) }
			</SidebarMenuItem>
			{ supports.emails && (
				<SidebarMenuItem
					icon={ envelope }
					to={ emailsRoute.fullPath }
					search={ { domainName } }
					activeOptions={ { includeSearch: false } }
				>
					{ __( 'Emails' ) }
				</SidebarMenuItem>
			) }
		</SidebarMenu>
	);
}
