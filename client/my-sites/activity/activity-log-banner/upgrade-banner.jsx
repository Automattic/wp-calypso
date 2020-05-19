/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import UpsellNudge from 'blocks/upsell-nudge';
import { isJetpackSite } from 'state/sites/selectors';
import {
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
} from 'lib/plans/constants';

/**
 * Style dependencies
 */
import './upgrade-banner.scss';

class UpgradeBanner extends Component {
	render() {
		const { translate, isJetpack } = this.props;
		return (
			<div className="activity-log-banner__upgrade">
				{ isJetpack ? (
					<UpsellNudge
						callToAction={ translate( 'Learn more' ) }
						event="activity_log_upgrade_click_jetpack"
						feature={ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY }
						plan={ PLAN_JETPACK_PERSONAL_MONTHLY }
						title={ translate( 'Unlock more activities now' ) }
						description={ translate(
							'With your free plan, you can monitor the 20 most ' +
								'recent events on your site. Upgrade to a paid plan to ' +
								'unlock powerful features:'
						) }
						showIcon={ true }
						list={ [
							translate( 'Access full activity for the past 30 days' ),
							translate( 'Filter events by type and date range' ),
						] }
					/>
				) : (
					<UpsellNudge
						forceDisplay={ true }
						callToAction={ translate( 'Learn more' ) }
						event="activity_log_upgrade_click_wpcom"
						feature={ FEATURE_JETPACK_ESSENTIAL }
						plan={ PLAN_PERSONAL }
						title={ translate( 'Unlock more activities now' ) }
						description={ translate(
							'With your free plan, you can monitor the 20 most ' +
								'recent events on your site. Upgrade to a paid plan to ' +
								'unlock powerful features:'
						) }
						showIcon={ true }
						list={ [
							translate( 'Access full activity for the past 30 days' ),
							translate( 'Filter events by type and date range' ),
						] }
					/>
				) }
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	isJetpack: isJetpackSite( state, siteId ),
	siteId: siteId,
} ) )( localize( UpgradeBanner ) );
