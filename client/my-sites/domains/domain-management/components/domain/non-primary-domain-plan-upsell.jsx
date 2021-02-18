/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { SETTING_PRIMARY_DOMAIN } from 'calypso/lib/url/support';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';
import { getPlansBySite } from 'calypso/state/sites/plans/selectors';

const NonPrimaryDomainPlanUpsell = ( {
	domain,
	hasNonPrimaryDomainsFlag,
	isDomainOnly,
	isOnPaidPlan,
	hasLoadedSitePlans,
	selectedSite,
	translate,
	tracksImpressionName,
	tracksClickName,
} ) => {
	if (
		! hasLoadedSitePlans ||
		! domain ||
		! selectedSite ||
		isOnPaidPlan ||
		! hasNonPrimaryDomainsFlag ||
		isDomainOnly ||
		! domain.pointsToWpcom ||
		domain.isPrimary ||
		domain.isWPCOMDomain ||
		domain.isWpcomStagingDomain
	) {
		return null;
	}

	return (
		<UpsellNudge
			title={ translate( 'This domain is being forwarded to %(primaryDomain)s', {
				args: {
					primaryDomain: selectedSite.slug,
				},
			} ) }
			description={ translate(
				'Upgrade to a paid plan to make {{strong}}%(domain)s{{/strong}} the primary address that your ' +
					'visitors see when they visit your site. {{a}}Learn more{{/a}}',
				{
					args: {
						domain: domain.name,
					},
					components: {
						a: <a href={ SETTING_PRIMARY_DOMAIN } target="_blank" rel="noopener noreferrer" />,
						strong: <strong />,
					},
				}
			) }
			callToAction={ translate( 'Upgrade' ) }
			tracksImpressionName={ tracksImpressionName }
			tracksClickName={ tracksClickName }
			event="calypso_non_primary_domain_plan_upsell"
			showIcon
		/>
	);
};

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const selectedSite = getSelectedSite( state );
	const sitePlans = selectedSite && getPlansBySite( state, selectedSite );

	return {
		isDomainOnly: selectedSiteId && isDomainOnlySite( state, selectedSiteId ),
		isOnPaidPlan: isSiteOnPaidPlan( state, selectedSiteId ),
		hasLoadedSitePlans: sitePlans && sitePlans.hasLoadedFromServer,
		hasNonPrimaryDomainsFlag: getCurrentUser( state )
			? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
		selectedSite,
	};
};

export default connect( mapStateToProps )( localize( NonPrimaryDomainPlanUpsell ) );
