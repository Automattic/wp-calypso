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
import { PLAN_PERSONAL, FEATURE_JETPACK_ESSENTIAL } from 'lib/plans/constants';

class UpgradeBanner extends Component {
	render() {
		const { translate, isJetpack } = this.props;
		if ( isJetpack ) {
			return null;
		}
		return (
			<div className="activity-log-banner__upgrade">
				<Banner
					callToAction={ translate( 'More Details' ) }
					dismissPreferenceName="activity-upgrade-banner-simple"
					event="activity_log_upgrade_click_wpcom"
					feature={ FEATURE_JETPACK_ESSENTIAL }
					plan={ PLAN_PERSONAL }
					title={ translate(
						'Upgrade your site today to unlock many powerful features, including:'
					) }
					description={ translate(
						'Improve your SEO, protect your site from spammers, ' +
							'and keep a closer eye on your site with expanded activity logs.'
					) }
				/>
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	isJetpack: isJetpackSite( state, siteId ),
	siteId: siteId,
} ) )( localize( UpgradeBanner ) );
