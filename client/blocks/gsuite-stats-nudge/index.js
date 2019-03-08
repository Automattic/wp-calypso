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
import isGSuiteStatsNudgeDismissed from 'state/selectors/is-gsuite-stats-nudge-dismissed';
import QueryPreferences from 'components/data/query-preferences';
import SectionHeader from 'components/section-header';
import { dismissNudge } from './actions';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { withEnhancers } from 'state/utils';

/**
 * Style dependencies
 */
import './style.scss';

class GSuiteStatsNudge extends Component {
	static propTypes = {
		isDismissed: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.recordView();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId && this.props.siteId && this.props.siteId !== prevProps.siteId ) {
			this.recordView();
		}
	}

	recordView() {
		if ( this.isVisible() ) {
			this.props.recordTracksEvent( 'calypso_gsuite_stats_nudge_view' );
		}
	}

	recordClick = eventName => {
		this.props.recordTracksEvent( eventName );
	};

	onDismissClick = () => {
		this.recordClick( 'calypso_gsuite_stats_nudge_dismiss_icon_click' );
		this.props.dismissNudge();
	};

	onStartNowClick = () => {
		this.recordClick( 'calypso_gsuite_stats_nudge_start_now_button_click' );
	};

	isVisible() {
		return ! this.props.isDismissed;
	}

	render() {
		const { translate } = this.props;

		if ( ! this.isVisible() ) {
			return null;
		}

		return (
			<Card className="gsuite-stats-nudge">
				<QueryPreferences />

				<Gridicon
					icon="cross"
					className="gsuite-stats-nudge__close-icon"
					onClick={ this.onDismissClick }
				/>

				<SectionHeader
					className="gsuite-stats-nudge__header"
					label={ translate( 'Recommendations from WordPress.com' ) }
				/>

				<div className="gsuite-stats-nudge__body">
					<div className="gsuite-stats-nudge__image-wrapper">
						<img
							className="gsuite-stats-nudge__image"
							src="/calypso/images/gsuite/illustration-builder-referral.svg"
							alt={ translate( 'Build your dream site with GSuite' ) }
						/>
					</div>

					<div className="gsuite-stats-nudge__info">
						<h1 className="gsuite-stats-nudge__title">
							{ translate( 'Need an expert to help realize your vision? Hire one!' ) }
						</h1>
						<p>
							{ translate(
								"We've partnered with GSuite, a network of freelancers with a huge pool of WordPress experts. They know their stuff and they're waiting to help you build your dream site."
							) }
						</p>
						<div className="gsuite-stats-nudge__button-row">
							<Button
								href={ '/experts/gsuite?source=stat-banner' }
								primary
								onClick={ this.onStartNowClick }
								target="_blank"
								rel="noopener noreferrer"
							>
								{ translate( 'Find your expert' ) }
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
		isDismissed: isGSuiteStatsNudgeDismissed( state, ownProps.siteId ),
	} ),
	{
		dismissNudge,
		recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
	}
)( localize( GSuiteStatsNudge ) );
