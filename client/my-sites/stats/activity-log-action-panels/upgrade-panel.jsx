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
import ActionPanel from 'components/action-panel/index';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelFooter from 'components/action-panel/footer';
import { addQueryArgs } from 'lib/url/index';
import Button from 'components/button/index';
import { isJetpackSite } from 'state/sites/selectors';
import {
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	PLAN_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
} from 'lib/plans/constants';
import { getSelectedSiteSlug } from 'state/ui/selectors';

class UpgradePanel extends Component {
	getDescription() {
		const { translate, isJetpack } = this.props;
		return isJetpack
			? translate(
					'Under your current free plan, you can only view the last 20 events on your site. ' +
						'Unlock your full site activity for the past 30 days by upgrading to the personal plan.' +
						"You'll also get access to daily automated backups, automated site restores, " +
						'site migration tools, spam filtering, and priority support.'
			  )
			: translate(
					'Under your current free plan, you can only view the last 20 events on your site. ' +
						'Unlock your full site activity for the past 30 days by upgrading to the personal plan.' +
						'You’ll also get access to a custom domain name, removal of WordPress.com ads, ' +
						'increased storage space to 6GB, and email & live chat support.'
			  );
	}
	getHref() {
		const { isJetpack, siteSlug } = this.props;
		const baseUrl = `/plans/${ siteSlug }`;
		const feature = isJetpack ? FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY : FEATURE_JETPACK_ESSENTIAL;
		const plan = isJetpack ? PLAN_JETPACK_PERSONAL_MONTHLY : PLAN_PERSONAL;
		return addQueryArgs(
			{
				feature,
				plan,
			},
			baseUrl
		);
	}
	render() {
		const { translate } = this.props;
		return (
			<div className="activity-log-action-panels__upgrade">
				<ActionPanel>
					<ActionPanelBody>
						<ActionPanelFigure inlineBodyText={ true }>
							<img
								src="/calypso/images/illustrations/laptop-website.svg"
								width="170"
								height="143"
								alt=""
							/>
						</ActionPanelFigure>
						<ActionPanelTitle>
							{ translate( "Upgrade to a Personal plan to access your site's full activity" ) }
						</ActionPanelTitle>
						<p>{ this.getDescription() }</p>
					</ActionPanelBody>
					<ActionPanelFooter>
						<Button primary href={ this.getHref() }>
							{ translate( 'More details' ) }
						</Button>
					</ActionPanelFooter>
				</ActionPanel>
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	isJetpack: isJetpackSite( state, siteId ),
	siteId: siteId,
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( UpgradePanel ) );
