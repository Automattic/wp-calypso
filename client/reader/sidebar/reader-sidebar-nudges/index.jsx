/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect, useDispatch } from 'react-redux';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import isEligibleForFreeToPaidUpsell from 'calypso/state/selectors/is-eligible-for-free-to-paid-upsell';
import getSites from 'calypso/state/selectors/get-sites';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { clickUpgradeNudge } from 'calypso/state/marketing/actions';
import UpsellNudge from 'calypso/blocks/upsell-nudge';

const debug = debugFactory( 'calypso:reader:sidebar-nudges' );

function renderFreeToPaidPlanNudge( { siteId, siteSlug, translate }, dispatch ) {
	return (
		<UpsellNudge
			event={ 'free-to-paid-sidebar-reader' }
			forceHref={ true }
			callToAction={ translate( 'Upgrade' ) }
			compact
			href={ '/plans/' + siteSlug }
			title={ translate( 'Free domain with an annual plan' ) }
			onClick={ () => dispatch( clickUpgradeNudge( siteId ) ) }
			tracksClickName={ 'calypso_upgrade_nudge_cta_click' }
			tracksImpressionName={ 'calypso_upgrade_nudge_impression' }
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

	isDevelopment &&
		debug(
			'siteCount: %d, eligible: %s',
			siteCount,
			isEligibleForFreeToPaidUpsell( state, siteId )
		);

	return {
		siteId,
		siteSlug,
		isEligibleForFreeToPaidUpsellNudge:
			siteCount === 1 && // available when a user owns one site only
			isEligibleForFreeToPaidUpsell( state, siteId ),
	};
}

export default connect( mapStateToProps )( localize( ReaderSidebarNudges ) );
