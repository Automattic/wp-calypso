import {
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_ACTIVITY_LOG,
	PLAN_PERSONAL,
	WPCOM_FEATURES_FULL_ACTIVITY_LOG,
} from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { preventWidows } from 'calypso/lib/formatting';
import { PRODUCT_UPSELLS_BY_FEATURE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';

import './upgrade-banner.scss';

class UpgradeBanner extends Component {
	render() {
		const { translate, isAtomic, isJetpack, siteSlug } = this.props;
		return (
			<div className="activity-log-banner__upgrade">
				{ isJetpack && ! isAtomic ? (
					<UpsellNudge
						callToAction={ translate( 'Upgrade now' ) }
						event="activity_log_upgrade_click_jetpack"
						feature={ WPCOM_FEATURES_FULL_ACTIVITY_LOG }
						href={ `/checkout/${ siteSlug }/${ PRODUCT_UPSELLS_BY_FEATURE[ FEATURE_ACTIVITY_LOG ] }` }
						title={ translate( 'Unlock more activities now' ) }
						description={ preventWidows(
							translate(
								'You currently have access to the 20 most recent events ' +
									'on your site. Upgrade to Jetpack VaultPress Backup ' +
									'or Jetpack Security to unlock powerful features:'
							)
						) }
						showIcon
						list={ [
							translate( 'Access full activity for the past 30 days.' ),
							translate( 'Filter events by type and date.' ),
						] }
					/>
				) : (
					<UpsellNudge
						forceDisplay
						callToAction={ translate( 'Upgrade now' ) }
						event="activity_log_upgrade_click_wpcom"
						feature={ FEATURE_JETPACK_ESSENTIAL }
						plan={ PLAN_PERSONAL }
						title={ translate( 'Unlock more activities now' ) }
						description={ preventWidows(
							translate(
								'With your free plan, you can monitor the 20 most ' +
									'recent events on your site. Upgrade to a paid plan to ' +
									'unlock powerful features:'
							)
						) }
						showIcon
						list={ [
							translate( 'Access full activity for the past 30 days.' ),
							translate( 'Filter events by type and date.' ),
						] }
					/>
				) }
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	isAtomic: isSiteAutomatedTransfer( state, siteId ),
	isJetpack: isJetpackSite( state, siteId ),
	siteId: siteId,
	siteSlug: getSiteSlug( state, siteId ),
} ) )( localize( UpgradeBanner ) );
