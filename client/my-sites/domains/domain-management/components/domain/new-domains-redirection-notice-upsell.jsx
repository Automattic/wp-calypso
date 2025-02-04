import { PLAN_PERSONAL, getPlan } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'calypso/state/current-user/constants';
import { currentUserHasFlag, getCurrentUser } from 'calypso/state/current-user/selectors';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';
import { getPlansBySite } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { hasCustomDomain } from '../../../../../lib/site/utils';

import './new-domains-redirection-notice-upsell.scss';

class NewDomainsRedirectionNoticeUpsell extends Component {
	render() {
		const {
			hasNonPrimaryDomainsFlag,
			isOnPaidPlan,
			hasLoadedSitePlans,
			hasCustomPrimaryDomain,
			selectedSite,
			selectedSiteId,
			translate,
		} = this.props;

		if (
			! hasLoadedSitePlans ||
			! selectedSite ||
			isOnPaidPlan ||
			! hasNonPrimaryDomainsFlag ||
			hasCustomPrimaryDomain
		) {
			return null;
		}

		const checkoutPlan = 'personal';

		return (
			<UpsellNudge
				className="new-domains-redirection-notice-upsell__banner"
				showIcon
				icon="info"
				href={ `/checkout/${ selectedSiteId }/${ checkoutPlan }` }
				title=""
				description={
					/* translators: %(planName)s is the short-hand version of the Personal plan name */
					translate(
						'Domains purchased on a free site will get redirected to %(primaryDomain)s. If you upgrade to ' +
							'the %(planName)s plan, you can use your own domain name instead of having WordPress.com ' +
							'in your URL.',
						{
							args: {
								primaryDomain: selectedSite.slug,
								planName: getPlan( PLAN_PERSONAL )?.getTitle() ?? '',
							},
						}
					)
				}
				callToAction={ translate( 'Upgrade' ) }
				primaryButton={ false }
				tracksImpressionName="calypso_new_domain_will_redirect_notice_upsell_impression"
				tracksClickName="calypso_new_domain_will_redirect_notice_upsell_upgrade_click"
				event="calypso_new_domain_will_redirect_notice_upsell"
			/>
		);
	}
}

const mapStateToProps = ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const selectedSite = getSelectedSite( state );
	const sitePlans = selectedSite && getPlansBySite( state, selectedSite );

	return {
		isOnPaidPlan: isSiteOnPaidPlan( state, selectedSiteId ),
		hasLoadedSitePlans: sitePlans && sitePlans.hasLoadedFromServer,
		hasNonPrimaryDomainsFlag: getCurrentUser( state )
			? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
		hasCustomPrimaryDomain: hasCustomDomain( selectedSite ),
		selectedSite,
		selectedSiteId,
	};
};

export default connect( mapStateToProps )( localize( NewDomainsRedirectionNoticeUpsell ) );
