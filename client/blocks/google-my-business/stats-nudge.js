/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { flow, partial } from 'lodash';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { recordTracksEvent } from 'state/analytics/actions';
import SectionHeader from 'components/section-header';
import QueryPreferences from 'components/data/query-preferences';
import { savePreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

const PREFERENCE_NAME = 'google-my-business-dimissible-nudge';

class GoogleMyBusinessStatsNudge extends Component {
	static propTypes = {
		siteSlug: PropTypes.string.isRequired,
		trackNudgeAlreadyListedClick: PropTypes.func.isRequired,
		trackNudgeDismissClick: PropTypes.func.isRequired,
		trackNudgeStartNowClick: PropTypes.func.isRequired,
		trackNudgeView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		nudgePreference: PropTypes.object,
	};

	componentWillMount() {
		this.props.trackNudgeView();
	}

	render() {
		return (
			<Card className="google-my-business__stats-nudge">
				<QueryPreferences />
				<Gridicon
					icon="cross"
					className="google-my-business__close-icon"
					onClick={ flow( this.props.trackNudgeDismissClick, this.props.updatePreference ) }
				/>
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
								onClick={ this.props.trackNudgeStartNowClick }
							>
								{ this.props.translate( 'Start Now' ) }
							</Button>

							<Button onClick={ this.props.trackNudgeAlreadyListedClick }>
								{ this.props.translate( "I'm Already Listed" ) }
							</Button>
						</div>
					</div>
				</div>
			</Card>
		);
	}
}

export default connect(
	state => {
		return {
			nudgePreference: getPreference( state, PREFERENCE_NAME ),
		};
	},
	dispatch =>
		bindActionCreators(
			{
				trackNudgeView: () =>
					recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_view' ),
				trackNudgeDismissClick: () =>
					recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_dismiss_icon_click' ),
				trackNudgeStartNowClick: () =>
					recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_start_now_button_click' ),
				trackNudgeAlreadyListedClick: () =>
					recordTracksEvent(
						'calypso_test_google_my_business_stats_nudge_already_button_listed_click'
					),
				updatePreference: nudgePreference => {
					return savePreference( PREFERENCE_NAME, {
						lastDismissed: Date.now(),
						timesDismissed: nudgePreference ? 1 + nudgePreference.timesDismissed : 1,
					} );
				},
			},
			dispatch
		),
	( stateProps, dispatchProps, ownProps ) => {
		return Object.assign( {}, ownProps, stateProps, dispatchProps, {
			updatePreference: partial( dispatchProps.updatePreference, stateProps.nudgePreference ),
		} );
	}
)( localize( GoogleMyBusinessStatsNudge ) );
