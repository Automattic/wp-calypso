import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getCurrentPartner,
	hasFetchedPartner,
} from 'calypso/state/partner-portal/partner/selectors';
import { isPartnerPortal } from 'calypso/state/partner-portal/selectors';

import './style.scss';

interface Props {
	className: string;
}

export default function PortalNav( { className = '' }: Props ): ReactElement | null {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const partnerFetched = useSelector( hasFetchedPartner );
	const partner = useSelector( getCurrentPartner );
	const isManagingSites = ! useSelector( isPartnerPortal );
	const selectedText = isManagingSites ? translate( 'Manage Sites' ) : translate( 'Licensing' );
	const show = partnerFetched && partner;

	if ( ! isSectionNameEnabled( 'jetpack-cloud-partner-portal' ) ) {
		return null;
	}

	const onNavItemClick = ( menuItem: string ) => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_jetpack_portal_nav_menu_click', {
				menu_item: menuItem,
			} )
		);
	};

	return (
		<>
			<QueryJetpackPartnerPortalPartner />

			{ show && (
				<SectionNav
					selectedText={ selectedText }
					className={ classnames( 'portal-nav', className ) }
				>
					<NavTabs label={ translate( 'Portal' ) }>
						<NavItem
							path="/"
							selected={ isManagingSites }
							onClick={ () => onNavItemClick( 'Manage Sites' ) }
						>
							{ translate( 'Manage Sites' ) }
						</NavItem>
						<NavItem
							path="/partner-portal"
							selected={ ! isManagingSites }
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
