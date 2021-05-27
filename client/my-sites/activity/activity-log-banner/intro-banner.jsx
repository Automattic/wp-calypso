/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';
import DismissibleCard from 'calypso/blocks/dismissible-card';
import ExternalLink from 'calypso/components/external-link';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import {
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_ACTIVITY_LOG,
	PLAN_PERSONAL,
	isFreePlan,
} from '@automattic/calypso-products';
import { PRODUCT_UPSELLS_BY_FEATURE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	siteHasBackupProductPurchase,
	siteHasScanProductPurchase,
} from 'calypso/state/purchases/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';

/**
 * Style dependencies
 */
import './intro-banner.scss';

/**
 * Image dependencies
 */
import activityImage from 'calypso/assets/images/illustrations/site-activity.svg';

class IntroBanner extends Component {
	recordLearnMore = () =>
		this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_learn_more' );

	recordUpgrade = () => this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_upgrade' );

	recordDismiss = () => this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_dismiss' );

	renderCardContent() {
		const { siteIsAtomic, siteIsJetpack, siteSlug, translate, siteHasActivityLog } = this.props;
		const buttonHref =
			siteIsJetpack && ! siteIsAtomic
				? `/checkout/${ siteSlug }/${ PRODUCT_UPSELLS_BY_FEATURE[ FEATURE_ACTIVITY_LOG ] }`
				: `/plans/${ siteSlug }?feature=${ FEATURE_JETPACK_ESSENTIAL }&plan=${ PLAN_PERSONAL }`;

		return (
			<>
				<p>
					{ translate(
						'We’ll keep track of all the events that take place on your site to help manage things easier. '
					) }
					{ siteHasActivityLog
						? translate(
								'Looking for something specific? You can filter the events by type and date.'
						  )
						: translate(
								'With your free plan, you can monitor the 20 most recent events on your site.'
						  ) }
				</p>
				{ ! siteHasActivityLog && (
					<>
						<p>{ translate( 'Upgrade to a paid plan to unlock powerful features:' ) }</p>
						<ul className="activity-log-banner__intro-list">
							<li>
								<Gridicon icon="checkmark" size={ 18 } />
								{ translate( 'Access full activity for the past 30 days.' ) }
							</li>
							<li>
								<Gridicon icon="checkmark" size={ 18 } />
								{ translate( 'Filter events by type and date.' ) }
							</li>
						</ul>

						<div className="activity-log-banner__intro-actions">
							<Button
								primary
								className="activity-log-banner__intro-button"
								href={ buttonHref }
								onClick={ this.recordUpgrade }
							>
								{ translate( 'Upgrade now' ) }
							</Button>
							<ExternalLink
								href="https://en.blog.wordpress.com/2018/10/30/introducing-activity/"
								icon
								onClick={ this.recordLearnMore }
								target="_blank"
							>
								{ translate( 'Learn more' ) }
							</ExternalLink>
						</div>
					</>
				) }
			</>
		);
	}

	render() {
		const { siteId, translate } = this.props;

		return (
			<Fragment>
				<QuerySitePurchases siteId={ siteId } />

				<DismissibleCard
					preferenceName="activity-introduction-banner"
					className="activity-log-banner__intro"
					onClick={ this.recordDismiss }
				>
					<div className="activity-log-banner__intro-description">
						<CardHeading tagName="h1" size={ 24 }>
							{ translate( 'Welcome to your site’s activity' ) }
						</CardHeading>
						{ this.renderCardContent() }
					</div>
					<img
						className="activity-log-banner__intro-image"
						src={ activityImage }
						alt={ translate( 'A site’s activity listed on a vertical timeline.' ) }
					/>
				</DismissibleCard>
			</Fragment>
		);
	}
}

export default connect(
	( state, { siteId } ) => {
		const siteIsOnFreePlan = isFreePlan( get( getCurrentPlan( state, siteId ), 'productSlug' ) );
		const hasBackupPurchase = siteHasBackupProductPurchase( state, siteId );
		const hasScanPurchase = siteHasScanProductPurchase( state, siteId );

		return {
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
			siteIsAtomic: isSiteAutomatedTransfer( state, siteId ),
			siteIsJetpack: isJetpackSite( state, siteId ),

			// TODO: Eventually use getRewindCapabilities to determine this?
			// Activity Log doesn't appear to show up there yet though.
			siteHasActivityLog: ! siteIsOnFreePlan || hasBackupPurchase || hasScanPurchase,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( IntroBanner ) );
