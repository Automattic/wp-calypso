import { domainQuery, siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, envelope } from '@wordpress/icons';
import { useEffect } from 'react';
import { useAppContext } from '../../app/context';
import { domainRoute } from '../../app/router/domains';
import { emailsRoute } from '../../app/router/emails';
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

	// The sidebar also unmounts inside the domain, on very slow navigations and viewport changes.
	useEffect(
		() => () => {
			const { pathname } = router.state.location;
			if ( pathname !== overviewPath && ! pathname.startsWith( `${ overviewPath }/` ) ) {
				setTransientQueryParamsAtPathname( overviewPath, {} );
			}
		},
		[ router, overviewPath ]
	);

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
	const router = useRouter();

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
					to={
						router.buildLocation( {
							to: emailsRoute.fullPath,
							search: { domainName },
						} ).href
					}
				>
					{ __( 'Emails' ) }
				</SidebarMenuItem>
			) }
		</SidebarMenu>
	);
}
