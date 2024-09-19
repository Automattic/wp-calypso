import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { dashboardPath } from 'calypso/lib/jetpack/paths';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	hasJetpackPartnerAccess as hasJetpackPartnerAccessSelector,
	showAgencyDashboard,
} from 'calypso/state/partner-portal/partner/selectors';
import { isPartnerPortal } from 'calypso/state/partner-portal/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPrimarySiteIsJetpack from 'calypso/state/selectors/get-primary-site-is-jetpack';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

interface Props {
	className: string;
}

const useManageSiteLink = () => {
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const isPrimarySiteJetpackSite = useSelector( getPrimarySiteIsJetpack );
	const currentUser = useSelector( getCurrentUser );

	return useMemo( () => {
		if ( selectedSiteSlug ) {
			return `/landing/${ selectedSiteSlug }`;
		}

		if ( isPrimarySiteJetpackSite && currentUser ) {
			return `/landing/${ currentUser.primarySiteSlug }`;
		}

		return '/landing';
	}, [ selectedSiteSlug, isPrimarySiteJetpackSite, currentUser ] );
};

export default function PortalNav( { className = '' }: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const hasJetpackPartnerAccess = useSelector( hasJetpackPartnerAccessSelector );
	const currentRoute = useSelector( getCurrentRoute );
	const showDashboard = useSelector( showAgencyDashboard );
	const isPartnerPortalRoute = useSelector( isPartnerPortal );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const manageSiteLink = useManageSiteLink();

	usePresalesChat(
		'jpAgency',
		hasJetpackPartnerAccess && isSectionNameEnabled( 'jetpack-cloud-partner-portal' ),
		true
	);

	// Route belongs dashboard when it starts with /dashboard or /plugins and no site is selected(multi-site view).
	const isDashboardRoute =
		currentRoute.startsWith( '/dashboard' ) ||
		( ! selectedSiteId && currentRoute.startsWith( '/plugins' ) );

	if ( ! isSectionNameEnabled( 'jetpack-cloud-partner-portal' ) ) {
		return null;
	}

	const dashboardLink = dashboardPath();

	const onNavItemClick = ( menuItem: string ) => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_jetpack_portal_nav_menu_click', {
				menu_item: menuItem,
			} )
		);
	};

	let selectedText = translate( 'Manage Sites' );

	if ( isPartnerPortalRoute ) {
		selectedText = translate( 'Licensing' );
	} else if ( isDashboardRoute ) {
		selectedText = translate( 'Dashboard' );
	}

	return (
		<>
			<QueryJetpackPartnerPortalPartner />

			{ hasJetpackPartnerAccess && (
				<SectionNav selectedText={ selectedText } className={ clsx( 'portal-nav', className ) }>
					<NavTabs label={ translate( 'Portal' ) }>
						{ showDashboard && (
							<NavItem
								path={ dashboardLink }
								selected={ isDashboardRoute }
								onClick={ () => onNavItemClick( 'Dashboard' ) }
							>
								{ translate( 'Dashboard' ) }
							</NavItem>
						) }
						<NavItem
							path={ manageSiteLink }
							selected={ ! ( isDashboardRoute || isPartnerPortalRoute ) }
							onClick={ () => onNavItemClick( 'Manage Sites' ) }
						>
							{ translate( 'Manage Sites' ) }
						</NavItem>
						<NavItem
							path="/partner-portal"
							selected={ isPartnerPortalRoute }
							onClick={ () => onNavItemClick( 'Licensing' ) }
						>
							{ translate( 'Licensing' ) }
						</NavItem>
					</NavTabs>
				</SectionNav>
			) }
		</>
	);
}
