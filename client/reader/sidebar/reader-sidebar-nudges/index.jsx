/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect, useDispatch } from 'react-redux';
import { localize, getLocaleSlug } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import QuerySitePlans from 'components/data/query-site-plans';
import SidebarBanner from 'my-sites/current-site/sidebar-banner';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
import isEligibleForFreeToPaidUpsell from 'state/selectors/is-eligible-for-free-to-paid-upsell';
import { isJetpackSite } from 'state/sites/selectors';
import getSites from 'state/selectors/get-sites';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import getPrimarySiteSlug from 'state/selectors/get-primary-site-slug';
import { clickUpgradeNudge } from 'state/marketing/actions';
import UpsellNudge from 'blocks/upsell-nudge';
import { abtest } from 'lib/abtest';

const debug = debugFactory( 'calypso:reader:sidebar-nudges' );

function renderFreeToPaidPlanNudge( { siteId, siteSlug, translate }, dispatch ) {
	if ( abtest( 'sidebarUpsellNudgeUnification' ) === 'variantShowUnifiedUpsells' ) {
		return (
			<UpsellNudge
				event={ 'free-to-paid-sidebar-reader' }
				forceHref={ true }
				callToAction={ translate( 'Upgrade' ) }
				compact
				href={ '/plans/' + siteSlug }
				title={ translate( 'Free domain with a plan' ) }
				onClick={ () => dispatch( clickUpgradeNudge( siteId ) ) }
				tracksClickName={ 'calypso_upgrade_nudge_cta_click' }
				tracksImpressionName={ 'calypso_upgrade_nudge_impression' }
			/>
		);
	}

	return (
		<SidebarBanner
			ctaName={ 'free-to-paid-sidebar-reader' }
			ctaText={ translate( 'Upgrade' ) }
			href={ '/plans/' + siteSlug }
			icon="info-outline"
			text={ translate( 'Free domain with a plan' ) }
			onClick={ () => dispatch( clickUpgradeNudge( siteId ) ) }
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
	const isDevelopment = 'development' === process.env.NODE_ENV;
	const siteCount = getSites( state ).length;
	const siteId = getPrimarySiteId( state );
	const siteSlug = getPrimarySiteSlug( state );
	const devCountryCode = isDevelopment && global.window && global.window.userCountryCode;
	const countryCode = devCountryCode || getCurrentUserCountryCode( state );
	const userLocale = getLocaleSlug( state );
	const isEnglish = [ 'en', 'en-gb' ].indexOf( userLocale ) !== -1;

	isDevelopment &&
		debug(
			'country: %s, locale: %s, siteCount: %d, eligible: %s',
			countryCode,
			userLocale,
			siteCount,
			isEligibleForFreeToPaidUpsell( state, siteId )
		);

	return {
		siteId,
		siteSlug,
		isEligibleForFreeToPaidUpsellNudge:
			siteCount === 1 && // available when a user owns one site only
			! isJetpackSite( state, siteId ) && // not for Jetpack sites
			! isDomainOnlySite( state, siteId ) && // not for domain only sites
			isEligibleForFreeToPaidUpsell( state, siteId ) &&
			// This nudge only shows up to US EN users.
			isEnglish &&
			'US' === countryCode,
	};
}

export default connect( mapStateToProps )( localize( ReaderSidebarNudges ) );
