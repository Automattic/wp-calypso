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
		return (
			<div className="activity-log-banner__upgrade">
				{ isJetpack ? (
					<Banner
						callToAction={ translate( 'Learn more' ) }
						event="activity_log_upgrade_click_jetpack"
						feature={ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY }
						plan={ PLAN_JETPACK_PERSONAL_MONTHLY }
						title={ translate( "Upgrade to a plan to access your site's complete activity" ) }
						description={ translate(
							"With your free plan, your site's Activity will only display the last 20 events. Upgrade and get:"
						) }
						list={ [
							translate( 'Full activity for the past 30 days' ),
							translate( 'Daily automated backups and spam filtering' ),
							translate( 'Site migration tools and daily automated restores' ),
							translate( 'Priority email and live chat support' ),
						] }
					/>
				) : (
					<Banner
						callToAction={ translate( 'Learn more' ) }
						event="activity_log_upgrade_click_wpcom"
						feature={ FEATURE_JETPACK_ESSENTIAL }
						plan={ PLAN_PERSONAL }
						title={ translate( "Upgrade to a plan to access your site's complete activity" ) }
						description={ translate(
							"With your free plan, your site's Activity will only display the last 20 events. Upgrade and get:"
						) }
						list={ [
							translate( 'Full activity for the past 30 days' ),
							translate( 'A custom domain name and removal of WordPress.com ads' ),
							translate( 'Increased storage space' ),
							translate( 'Priority email and live chat support' ),
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
