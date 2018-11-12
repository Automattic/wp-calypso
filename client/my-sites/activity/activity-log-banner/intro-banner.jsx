/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import DismissibleCard from 'blocks/dismissible-card';
import CardHeading from 'components/card-heading';
import Button from 'components/button';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { isFreePlan } from 'lib/plans';
//import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';

class IntroBanner extends Component {
	recordLearnMore = () => {
		//console.log( 'TO DO, record track: calypso_activitylog_intro_banner_learn_more' );
	};

	cardContent() {
		const { translate, siteIsOnFreePlan } = this.props;
		return siteIsOnFreePlan ? (
			<Fragment>
				<p>
					{ translate(
						'Monitoring your site should be as simple as possible. ' +
							'Activity takes care of tracking all events that occur on ' +
							'your site, so you can have peace of mind.'
					) }
				</p>
				<p>
					{ translate(
						'With your free plan, you only have access to the 20 most ' +
							'recent activity items on your site. With a paid plan, you can ' +
							'unlock more powerful features such as full activity for the past ' +
							'30 days, and the ability to filter events so you can quickly find ' +
							'the information you’re looking for. '
					) }
					<a
						href="https://en.blog.wordpress.com/2018/10/30/introducing-activity/"
						target="_blank"
						rel="noopener noreferrer"
						onClick={ this.recordLearnMore }
					>
						{ translate( 'Learn more' ) }
					</a>
					.
				</p>
				<Button className="activity-log-banner__intro-button" href="/plans/">
					{ translate( 'Upgrade now' ) }
				</Button>
			</Fragment>
		) : (
			<Fragment>
				<p>
					{ translate(
						'Monitoring your site should be as simple as possible. ' +
							'Activity takes care of tracking all events that occur on ' +
							'your site, so you can have peace of mind.'
					) }
				</p>
				<p>
					{ translate(
						'Explore the list below or filter events so you can quickly ' +
							'find the information you’re looking for. '
					) }
					<a
						href="https://en.blog.wordpress.com/2018/10/30/introducing-activity/"
						target="_blank"
						rel="noopener noreferrer"
						onClick={ this.recordLearnMore }
					>
						{ translate( 'Learn more' ) }
					</a>
					.
				</p>
			</Fragment>
		);
	}

	render() {
		const { translate } = this.props;
		return (
			<DismissibleCard
				preferenceName="activity-introduction-banner"
				className="activity-log-banner__intro"
			>
				<img
					className="activity-log-banner__intro-image"
					src="/calypso/images/illustrations/jetpack-site-activity.svg"
					alt="Activity"
				/>
				<div className="activity-log-banner__intro-description">
					<CardHeading tagName="h1" size={ 24 }>
						{ translate( 'Welcome to your site’s activity' ) }
					</CardHeading>
					{ this.cardContent() }
				</div>
			</DismissibleCard>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	siteId: siteId,
	siteIsOnFreePlan: isFreePlan( get( getCurrentPlan( state, siteId ), 'productSlug' ) ),
} ) )( localize( IntroBanner ) );
