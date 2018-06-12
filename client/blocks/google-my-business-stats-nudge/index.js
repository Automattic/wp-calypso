/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import isGoogleMyBusinessStatsNudgeDismissed from 'state/selectors/is-google-my-business-stats-nudge-dismissed';
import QueryPreferences from 'components/data/query-preferences';
import SectionHeader from 'components/section-header';
import { dismissNudge } from './actions';
import { enhanceWithDismissCount } from 'my-sites/google-my-business/utils';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { withEnhancers } from 'state/utils';

class GoogleMyBusinessStatsNudge extends Component {
	static propTypes = {
		isDismissed: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentWillMount() {
		if ( ! this.props.isDismissed ) {
			this.props.recordTracksEvent( 'calypso_google_my_business_stats_nudge_view' );
		}
	}

	onDismissClick = () => {
		this.props.recordTracksEvent( 'calypso_google_my_business_stats_nudge_dismiss_icon_click' );
		this.props.dismissNudge();
	};

	onStartNowClick = () => {
		this.props.recordTracksEvent( 'calypso_google_my_business_stats_nudge_start_now_button_click' );
	};

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
					onClick={ this.onDismissClick }
				/>

				<SectionHeader
					className="google-my-business-stats-nudge__header"
					label={ this.props.translate( 'Recommendations from WordPress.com' ) }
				/>

				<div className="google-my-business-stats-nudge__body">
					<div className="google-my-business-stats-nudge__image-wrapper">
						<img
							className="google-my-business-stats-nudge__image"
							src="/calypso/images/google-my-business/phone-screenshot-cropped.png"
							alt={ this.props.translate( 'Your business with Google My Business' ) }
						/>
					</div>

					<div className="google-my-business-stats-nudge__info">
						<h1 className="google-my-business-stats-nudge__title">
							{ this.props.translate( 'Can your customers find you on Google?' ) }
						</h1>

						<h2 className="google-my-business-stats-nudge__description">
							{ this.props.translate(
								'Be there when customers search businesses like yours on Google Search and Maps.'
							) }
						</h2>

						<div className="google-my-business-stats-nudge__button-row">
							<Button
								href={ `/google-my-business/${ this.props.siteSlug }` }
								primary
								onClick={ this.onStartNowClick }
							>
								{ this.props.translate( 'Start Now' ) }
							</Button>
						</div>
					</div>
				</div>
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isDismissed: isGoogleMyBusinessStatsNudgeDismissed( state, ownProps.siteId ),
	} ),
	{
		dismissNudge,
		recordTracksEvent: withEnhancers( recordTracksEvent, [
			enhanceWithDismissCount,
			enhanceWithSiteType,
		] ),
	}
)( localize( GoogleMyBusinessStatsNudge ) );
