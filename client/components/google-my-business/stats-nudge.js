/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import DismissibleCard from 'blocks/dismissible-card';
import { recordTracksEvent } from 'state/analytics/actions';
import SectionHeader from 'components/section-header';

const TWO_WEEKS_IN_SECONDS = 60 * 60 * 24 * 14;

class GoogleMyBusinessStatsNudge extends Component {
	static propTypes = {
		siteSlug: PropTypes.string.isRequired,
		trackNudgeShown: PropTypes.func.isRequired,
		trackNudgeDismissed: PropTypes.func.isRequired,
		trackNudgeStartNowClicked: PropTypes.func.isRequired,
		trackNudgeAlreadyListedClicked: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentWillMount() {
		this.props.trackNudgeShown();
	}

	render() {
		return (
			<DismissibleCard
				className="google-my-business__stats-nudge"
				preferenceName="google-my-business-nudge"
				temporary={ TWO_WEEKS_IN_SECONDS }
				onClick={ this.props.trackNudgeDismissed }
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
							<Button
								href={ `/google-my-business/${ this.props.siteSlug }` }
								primary
								onClick={ this.props.trackNudgeStartNowClicked }
							>
								{ this.props.translate( 'Start Now' ) }
							</Button>
							<Button
								href={ `/google-my-business/${ this.props.siteSlug }` }
								onClick={ this.props.trackNudgeAlreadyListedClicked }
							>
								{ this.props.translate( "I've Already Listed" ) }
							</Button>
						</div>
					</div>
				</div>
			</DismissibleCard>
		);
	}
}

export default connect( () => ( {} ), {
	trackNudgeShown: () => recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_shown' ),
	trackNudgeDismissed: () =>
		recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_dismissed' ),
	trackNudgeStartNowClicked: () =>
		recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_start_now_clicked' ),
	trackNudgeAlreadyListedClicked: () =>
		recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_already_listed_clicked' ),
} )( localize( GoogleMyBusinessStatsNudge ) );
