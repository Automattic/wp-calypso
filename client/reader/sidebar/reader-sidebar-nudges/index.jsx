/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect, useDispatch } from 'react-redux';
import { localize, getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySitePlans from 'components/data/query-site-plans';
import SidebarBanner from 'my-sites/current-site/sidebar-banner';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isEligibleForFreeToPaidUpsell from 'state/selectors/is-eligible-for-free-to-paid-upsell';
import { isJetpackSite } from 'state/sites/selectors';
import getSites from 'state/selectors/get-sites';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import getPrimarySiteSlug from 'state/selectors/get-primary-site-slug';
import { clickUpgradeNudge } from 'state/marketing/actions';

/**
 * Style dependencies
 */
import './style.scss';

function renderFreeToPaidPlanNudge( { siteId, siteSlug, translate }, dispatch ) {
	return (
		<SidebarBanner
			ctaName={ 'free-to-paid-sidebar-reader' }
			ctaText={ translate( 'Upgrade' ) }
			href={ '/plans/' + siteSlug }
			icon="info-outline"
			text={ translate( 'Free domain with a plan' ) }
			onClick={ () => dispatch( clickUpgradeNudge( siteId ) ) }
			className="reader-sidebar-nudges"
		/>
	);
}

export function ReaderSidebarNudges( props ) {
	const dispatch = useDispatch();

	return (
		<Fragment>
			<QuerySitePlans siteId={ props.siteId } />
			{ props.isEligibleForFreeToPaidUpsellNudge && renderFreeToPaidPlanNudge( props, dispatch ) }
		</Fragment>
	);
}

function mapStateToProps( state ) {
	const siteCount = getSites( state ).length;
	const siteId = getPrimarySiteId( state );
	const siteSlug = getPrimarySiteSlug( state );

	return {
		siteId,
		siteSlug,
		isEligibleForFreeToPaidUpsellNudge:
			siteCount === 1 && // available for the user who owns one site only
			'en' === getLocaleSlug( state ) && // only for English speakers
			! isDomainOnlySite( state, siteId ) && // not for domain only sites
			! isJetpackSite( state, siteId ) && // not for Jetpack sites
			isEligibleForFreeToPaidUpsell( state, siteId ),
	};
}

export default connect( mapStateToProps )( localize( ReaderSidebarNudges ) );
