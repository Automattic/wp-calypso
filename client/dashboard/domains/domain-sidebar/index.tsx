import { domainQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { category, envelope } from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import { domainRoute } from '../../app/router/domains';
import { emailsRoute } from '../../app/router/emails';
import {
	getSnackbarBackButtonNavigateOptions,
	type SnackbarBackTo,
} from '../../app/snackbar-back-button';
import { getTransientQueryParamsAtPathname } from '../../app/transient-query-params';
import { SidebarBackButton, SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import DomainSwitcherItem from './domain-switcher-item';

export default function DomainSidebar() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useQuery( domainQuery( domainName ) );
	const router = useRouter();
	const { back_to: backToParam } = useSearch( { strict: false } ) as {
		back_to?: SnackbarBackTo;
	};

	if ( ! domain ) {
		return null;
	}

	// The overview persists `back_to`, so its subpages keep going up to the site too.
	const backTo =
		backToParam ??
		( getTransientQueryParamsAtPathname( `/domains/${ domainName }` )?.back_to as
			SnackbarBackTo | undefined );
	const backToSite = getSnackbarBackButtonNavigateOptions( backTo, {
		siteSlug: domain.site_slug,
	} );

	return (
		<VStack spacing={ 2 }>
			<SidebarBackButton to={ backToSite ? router.buildLocation( backToSite ).href : '/domains' }>
				{ backToSite ? __( 'Back to site' ) : __( 'Back to Domains' ) }
			</SidebarBackButton>
			<VStack spacing={ 4 }>
				<DomainSwitcherItem domain={ domain } />
				<DomainMenuSidebar domainName={ domainName } />
			</VStack>
		</VStack>
	);
}

function DomainMenuSidebar( { domainName }: { domainName: string } ) {
	const { supports } = useAppContext();
	const router = useRouter();

	return (
		<SidebarMenu>
			<SidebarMenuItem icon={ category } to={ `/domains/${ domainName }` }>
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
