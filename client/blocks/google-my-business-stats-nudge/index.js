/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { flow } from 'lodash';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { recordTracksEvent } from 'state/analytics/actions';
import SectionHeader from 'components/section-header';
import QueryPreferences from 'components/data/query-preferences';
import { isGoogleMyBusinessStatsNudgeDismissed } from 'state/selectors';
import { dismissNudge } from './actions';

class GoogleMyBusinessStatsNudge extends Component {
	static propTypes = {
		siteSlug: PropTypes.string.isRequired,
		trackNudgeAlreadyListedClick: PropTypes.func.isRequired,
		trackNudgeDismissClick: PropTypes.func.isRequired,
		trackNudgeStartNowClick: PropTypes.func.isRequired,
		trackNudgeView: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentWillMount() {
		if ( ! this.props.isDismissed ) {
			this.props.trackNudgeView();
		}
	}

	render() {
		if ( this.props.isDismissed ) {
			return null;
		}

		return (
			<Card className="google-my-business-stats-nudge">
				<QueryPreferences />
				<Gridicon
					icon="cross"
					className="google-my-business-stats-nudge__close-icon"
					onClick={ flow( this.props.trackNudgeDismissClick, this.props.dismissNudge ) }
				/>
				<SectionHeader
					className="google-my-business-stats-nudge__header"
					label={ this.props.translate( 'Recommendation from WordPress.com' ) }
				/>

				<div className="google-my-business-stats-nudge__body">
					<div className="google-my-business-stats-nudge__image-wrapper">
						<img
							className="google-my-business-stats-nudge__image"
							src="/calypso/images/google-my-business/phone-screenshot.png"
							alt={ this.props.translate( 'Your business with Google My Business' ) }
						/>
					</div>

					<div className="google-my-business-stats-nudge__info">
						<h1 className="google-my-business-stats-nudge__title">
							{ this.props.translate( 'Reach more customers with Google My Business' ) }
						</h1>

						<h2 className="google-my-business-stats-nudge__description">
							{ this.props.translate(
								'Show up when customers search for businesses like yours on Google Search and Maps.'
							) }
						</h2>

						<div className="google-my-business-stats-nudge__button-row">
							<Button
								href={ `/google-my-business/${ this.props.siteSlug }` }
								primary
								onClick={ this.props.trackNudgeStartNowClick }
							>
								{ this.props.translate( 'Start Now' ) }
							</Button>

							<Button
								onClick={ flow( this.props.trackNudgeAlreadyListedClick, this.props.dismissNudge ) }
							>
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
	state => ( {
		isDismissed: isGoogleMyBusinessStatsNudgeDismissed( state ),
	} ),
	{
		trackNudgeView: () => recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_view' ),
		trackNudgeDismissClick: () =>
			recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_dismiss_icon_click' ),
		trackNudgeStartNowClick: () =>
			recordTracksEvent( 'calypso_test_google_my_business_stats_nudge_start_now_button_click' ),
		trackNudgeAlreadyListedClick: () =>
			recordTracksEvent(
				'calypso_test_google_my_business_stats_nudge_already_button_listed_click'
			),
		dismissNudge,
	}
)( localize( GoogleMyBusinessStatsNudge ) );
