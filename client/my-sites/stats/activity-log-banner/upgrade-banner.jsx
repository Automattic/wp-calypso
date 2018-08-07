/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isJetpackSite } from 'state/sites/selectors';
import Banner from 'components/banner';
import {
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
} from 'lib/plans/constants';

class UpgradeBanner extends Component {
	render() {
		const { translate, isJetpack } = this.props;
		return isJetpack ? (
			<div className="activity-log-banner__upgrade">
				<Banner
					callToAction={ translate( 'Learn more' ) }
					dismissPreferenceName="activity-upgrade-banner-jetpack"
					event="activity_log_upgrade_click_wpcom"
					feature={ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY }
					plan={ PLAN_JETPACK_PERSONAL_MONTHLY }
					title={ translate( "Upgrade to a Personal plan to access your site's full activity" ) }
					description={ translate(
						'Under your current free plan, you can only view the last 20 events on your site. ' +
							'Upgrade to the Personal plan to unlock:'
					) }
					list={ [
						translate( "Your site's full activity for the past 30 days" ),
						translate( 'Daily automated backups and spam filtering' ),
						translate( 'Daily automated site restores and site migration tools' ),
						translate( 'Priority email & live chat support' ),
					] }
				/>
			</div>
		) : (
			<div className="activity-log-banner__upgrade">
				<Banner
					callToAction={ translate( 'Learn more' ) }
					dismissPreferenceName="activity-upgrade-banner-wpcom"
					event="activity_log_upgrade_click_wpcom"
					feature={ FEATURE_JETPACK_ESSENTIAL }
					plan={ PLAN_PERSONAL }
					title={ translate( "Upgrade to a Personal plan to access your site's full activity" ) }
					description={ translate(
						'Under your current free plan, you can only view the last 20 events on your site. ' +
							'Upgrade to the Personal plan to unlock:'
					) }
					list={ [
						translate( "Your site's full activity for the past 30 days" ),
						translate( 'Daily automated backups and spam filtering' ),
						translate( 'Daily automated site restores and site migration tools' ),
						translate( 'Priority email & live chat support' ),
					] }
				/>
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	isJetpack: isJetpackSite( state, siteId ),
	siteId: siteId,
} ) )( localize( UpgradeBanner ) );
