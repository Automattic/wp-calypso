/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isJetpackSite } from 'state/sites/selectors';
import Banner from 'components/banner';
import {
	PLAN_PERSONAL,
	PLAN_JETPACK_PERSONAL,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	FEATURE_NO_ADS,
} from 'lib/plans/constants';

class UpgradeBanner extends PureComponent {
	render() {
		const { isJetpack, translate } = this.props;
		return (
			<div className="activity-log-banner__upgrade">
				{ isJetpack ? (
					<Banner
						callToAction={ translate( 'Get daily backups' ) }
						dismissPreferenceName="activity-upgrade-banner-jetpack"
						event="track_event"
						feature={ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY }
						list={ [
							translate( 'See all site activity over the past month' ),
							translate( 'Rewind your site back to any point' ),
							translate( 'Automatic threat scanning' ),
						] }
						plan={ PLAN_JETPACK_PERSONAL }
						title={ translate( 'Secure your site with daily backups' ) }
					/>
				) : (
					<Banner
						callToAction={ translate( 'Upgrade' ) }
						dismissPreferenceName="activity-upgrade-banner-simple"
						event="track_event"
						feature={ FEATURE_NO_ADS }
						list={ [
							translate( 'Get a custom domain name' ),
							translate( 'Remove WordPress.com ads' ),
							translate( 'See 30 days of past activity' ),
						] }
						plan={ PLAN_PERSONAL }
						title={ translate( 'Upgrade your WordPress.com experience' ) }
					/>
				) }
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	isJetpack: isJetpackSite( state, siteId ),
} ) )( localize( UpgradeBanner ) );
