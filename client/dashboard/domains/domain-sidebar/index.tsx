import { domainQuery, siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter, useSearch } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, envelope } from '@wordpress/icons';
import { useEffect } from 'react';
import { useAppContext } from '../../app/context';
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

// Not a pathname, so breadcrumbs never add it to a link.
const EMAILS_ORIGIN_KEY = 'domain-sidebar-emails-origin';

function getOpenDomainName() {
	return getTransientQueryParamsAtPathname( EMAILS_ORIGIN_KEY )?.domainName as string | undefined;
}

/**
 * Whether the match is an email screen reached from the domain whose sidebar is
 * open, so the sidebar stays there. Screens that name no domain, such as
 * choosing one, count; the unfiltered list and other domains don't.
 */
export function isOpenDomainEmailsMatch( { routeId, params, search }: AnyRouteMatch ) {
	const openDomainName = getOpenDomainName();
	if ( ! openDomainName || ! routeId.startsWith( `${ emailsRoute.fullPath }/` ) ) {
		return false;
	}
	const domainName = params.domain ?? search.domainName;
	return domainName ? domainName === openDomainName : routeId !== emailsIndexRoute.id;
}

export default function DomainSidebar() {
	const { domainName: domainParam } = useParams( { strict: false } );
	const domainName = ( domainParam ?? getOpenDomainName() ) as string;
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

	// The sidebar also unmounts inside the domain, on very slow navigations and viewport changes.
	useEffect( () => {
		setTransientQueryParamsAtPathname( EMAILS_ORIGIN_KEY, { domainName } );
		return () => {
			// Matched from the location, as `router.state.matches` lags during pending navigations.
			const matches = router.matchRoutes( router.state.location );
			const match = matches[ matches.length - 1 ];
			if (
				match?.params.domainName !== domainName &&
				! ( match && isOpenDomainEmailsMatch( match ) )
			) {
				setTransientQueryParamsAtPathname( `/domains/${ domainName }`, {} );
				setTransientQueryParamsAtPathname( EMAILS_ORIGIN_KEY, {} );
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
