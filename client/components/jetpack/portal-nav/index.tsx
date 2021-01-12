/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isSectionNameEnabled } from 'calypso/sections-filter';
import {
	getCurrentPartner,
	hasFetchedPartner,
	isPartnerPortal,
} from 'calypso/state/partner-portal/selectors';
import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavItem from 'calypso/components/section-nav/item';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	className: string;
}

export default function PortalNav( { className = '' }: Props ): ReactElement | null {
	const translate = useTranslate();
	const partnerFetched = useSelector( hasFetchedPartner );
	const partner = useSelector( getCurrentPartner );
	const isManagingSites = ! useSelector( isPartnerPortal );
	const selectedText = isManagingSites
		? translate( 'Manage Sites' )
		: translate( 'Partner Portal' );
	const show = partnerFetched && partner;

	if ( ! isSectionNameEnabled( 'jetpack-cloud-partner-portal' ) ) {
		return null;
	}

	return (
		<>
			<QueryJetpackPartnerPortalPartner />

			{ show && (
				<SectionNav
					selectedText={ selectedText }
					className={ classnames( 'portal-nav', className ) }
				>
					<NavTabs label={ translate( 'Portal' ) }>
						<NavItem path="/" selected={ isManagingSites }>
							{ translate( 'Manage Sites' ) }
						</NavItem>
						<NavItem path="/partner-portal" selected={ ! isManagingSites }>
							{ translate( 'Partner Portal' ) }
						</NavItem>
					</NavTabs>
				</SectionNav>
			) }
		</>
	);
}
