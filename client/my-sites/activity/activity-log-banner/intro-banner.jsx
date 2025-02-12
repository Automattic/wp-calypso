import {
	FEATURE_JETPACK_ESSENTIAL,
	FEATURE_ACTIVITY_LOG,
	PLAN_PERSONAL,
	WPCOM_FEATURES_FULL_ACTIVITY_LOG,
} from '@automattic/calypso-products';
import { Button, Gridicon, ExternalLink } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import activityImage from 'calypso/assets/images/illustrations/site-activity.svg';
import DismissibleCard from 'calypso/blocks/dismissible-card';
import CardHeading from 'calypso/components/card-heading';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import { preventWidows } from 'calypso/lib/formatting';
import { PRODUCT_UPSELLS_BY_FEATURE } from 'calypso/my-sites/plans/jetpack-plans/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';

import './intro-banner.scss';

class IntroBanner extends Component {
	recordLearnMore = () =>
		this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_learn_more' );

	recordUpgrade = () => this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_upgrade' );

	recordDismiss = () => this.props.recordTracksEvent( 'calypso_activitylog_intro_banner_dismiss' );

	renderUpgradeIntroText() {
		const { translate, siteIsJetpack, siteHasFullActivityLog } = this.props;
		if ( siteHasFullActivityLog ) {
			return preventWidows(
				translate( 'Looking for something specific? You can filter the events by type and date.' )
			);
		}
		if ( siteIsJetpack ) {
			return preventWidows(
				translate( 'You currently have access to the 20 most recent events on your site.' )
			);
		}
		return preventWidows(
			translate( 'With your free plan, you can monitor the 20 most recent events on your site.' )
		);
	}

	renderCardContent() {
		const { siteIsAtomic, siteIsJetpack, siteSlug, translate, siteHasFullActivityLog } = this.props;
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
					{ this.renderUpgradeIntroText() }
				</p>
				{ ! siteHasFullActivityLog && (
					<>
						<p>
							{ siteIsJetpack
								? translate(
										'Upgrade to Jetpack VaultPress Backup or Jetpack Security to unlock powerful features:'
								  )
								: translate( 'Upgrade to a paid plan to unlock powerful features:' ) }
						</p>
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
				<QuerySiteFeatures siteIds={ [ siteId ] } />

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
		return {
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
			siteIsAtomic: isSiteAutomatedTransfer( state, siteId ),
			siteIsJetpack: isJetpackSite( state, siteId ),
			siteHasFullActivityLog: siteHasFeature( state, siteId, WPCOM_FEATURES_FULL_ACTIVITY_LOG ),
		};
	},
	{
		recordTracksEvent,
	}
)( localize( IntroBanner ) );
