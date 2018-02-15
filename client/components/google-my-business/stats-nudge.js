/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import DismissibleCard from 'blocks/dismissible-card';
import SectionHeader from 'components/section-header';

class GMBStatsNudge extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	recordNudgeShown() {
		analytics.tracks.recordEvent( 'calypso_test_google_my_business_stats_nudge_shown' );
	}

	render() {
		return (
			<DismissibleCard
				className="google-my-business__stats-nudge"
				preferenceName="show-google-my-business-nudge"
				temporary
			>
				<SectionHeader
					className="google-my-business__stats-nudge-header"
					label={ this.props.translate( 'Recommendation from WordPress.com' ) }
				/>
				<div className="google-my-business__stats-nudge-body">
					<div className="google-my-business__stats-nudge-image-wrapper">
						<img
							className="google-my-business__stats-nudge-image"
							src="/calypso/images/google-my-business/phone-screenshot.png"
							alt={ this.props.translate( 'Your business with Google My Business' ) }
						/>
					</div>
					<div className="google-my-business__stats-nudge-info">
						<h1 className="google-my-business__stats-nudge-title">
							{ this.props.translate( 'Reach more customers with Google My Business' ) }
						</h1>
						<h2 className="google-my-business__stats-nudge-description">
							{ this.props.translate(
								'Show up when customers search for businesses like yours on Google Search and Maps.'
							) }
						</h2>
						<div className="google-my-business__stats-nudge-button-row">
							<Button primary>{ this.props.translate( 'Start Now' ) }</Button>
							<Button>{ this.props.translate( "I've Already Listed" ) }</Button>
						</div>
					</div>
				</div>
			</DismissibleCard>
		);
	}

	componentWillMount() {
		this.recordNudgeShown();
	}
}

export default localize( GMBStatsNudge );
