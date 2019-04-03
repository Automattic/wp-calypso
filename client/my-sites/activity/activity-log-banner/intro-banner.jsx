/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CardHeading from 'components/card-heading';
import DismissibleCard from 'blocks/dismissible-card';
import ExternalLink from 'components/external-link';
import {
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_PERSONAL,
} from 'lib/plans/constants';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { isFreePlan } from 'lib/plans';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './intro-banner.scss';

class IntroBanner extends Component {
	recordLearnMore = () =>
		this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_learn_more' );

	recordUpgrade = () => this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_upgrade' );

	recordDismiss = () => this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_dismiss' );

	renderCardContent() {
		const { siteIsJetpack, siteIsOnFreePlan, siteSlug, translate } = this.props;
		const upgradePlan = siteIsJetpack ? PLAN_JETPACK_PERSONAL_MONTHLY : PLAN_PERSONAL;
		const upgradeFeature = siteIsJetpack
			? FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY
			: FEATURE_JETPACK_ESSENTIAL;

		return (
			<Fragment>
				<p>
					{ translate(
						'Activity tracks the events that occur on your site so that you don’t have to.'
					) }
				</p>
				<p>
					{ siteIsOnFreePlan
						? translate(
								'With your free plan, you can monitor the 20 most recent ' +
									'events. A paid plan unlocks more powerful features. ' +
									'You can access all site activity for the last 30 days ' +
									'and filter events by type and date range to quickly find ' +
									'the information you need. '
						  )
						: translate(
								'Explore the list below or filter events by type and ' +
									'date range to quickly find the information you need. '
						  ) }
					<ExternalLink
						href="https://en.blog.wordpress.com/2018/10/30/introducing-activity/"
						icon
						onClick={ this.recordLearnMore }
						target="_blank"
					>
						{ translate( 'Learn more' ) }
					</ExternalLink>
				</p>

				{ siteIsOnFreePlan && (
					<Button
						className="activity-log-banner__intro-button"
						href={ `/plans/${ siteSlug }?feature=${ upgradeFeature }&plan=${ upgradePlan }` }
						onClick={ this.recordUpgrade }
					>
						{ translate( 'Upgrade now' ) }
					</Button>
				) }
			</Fragment>
		);
	}

	render() {
		const { translate } = this.props;
		return (
			<DismissibleCard
				preferenceName="activity-introduction-banner"
				className="activity-log-banner__intro"
				onClick={ this.recordDismiss }
			>
				<img
					className="activity-log-banner__intro-image"
					src="/calypso/images/illustrations/jetpack-site-activity.svg"
					alt={ translate( 'Activity' ) }
				/>
				<div className="activity-log-banner__intro-description">
					<CardHeading tagName="h1" size={ 24 }>
						{ translate( 'Welcome to your site’s activity' ) }
					</CardHeading>
					{ this.renderCardContent() }
				</div>
			</DismissibleCard>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		siteId,
		siteIsJetpack: isJetpackSite( state, siteId ),
		siteIsOnFreePlan: isFreePlan( get( getCurrentPlan( state, siteId ), 'productSlug' ) ),
		siteSlug: getSiteSlug( state, siteId ),
	} ),
	{
		recordTracksEvent,
	}
)( localize( IntroBanner ) );
