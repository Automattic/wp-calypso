/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';

/**
 * Internal Dependencies
 */
import { Button, Card } from '@automattic/components';
import isUpworkStatsNudgeDismissed from 'state/selectors/is-upwork-stats-nudge-dismissed';
import QueryPreferences from 'components/data/query-preferences';
import SectionHeader from 'components/section-header';
import { dismissNudge } from './actions';
import { enhanceWithSiteType, recordTracksEvent } from 'state/analytics/actions';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { withEnhancers } from 'state/utils';

/**
 * Style dependencies
 */
import './style.scss';

class UpworkStatsNudge extends Component {
	static propTypes = {
		isDismissed: PropTypes.bool.isRequired,
		plan: PropTypes.object,
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
			this.props.recordTracksEvent( 'calypso_upwork_stats_nudge_view' );
		}
	}

	recordClick = ( eventName ) => {
		const plan = this.props.plan ? this.props.plan.productSlug : '';

		this.props.recordTracksEvent( eventName, { plan } );
	};

	onDismissClick = () => {
		this.recordClick( 'calypso_upwork_stats_nudge_dismiss_icon_click' );
		this.props.dismissNudge();
	};

	onStartNowClick = () => {
		this.recordClick( 'calypso_upwork_stats_nudge_start_now_button_click' );
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
			<Card className="upwork-stats-nudge">
				<QueryPreferences />

				<Gridicon
					icon="cross"
					className="upwork-stats-nudge__close-icon"
					onClick={ this.onDismissClick }
				/>

				<SectionHeader
					className="upwork-stats-nudge__header"
					label={ translate( 'Recommendations from WordPress.com' ) }
				/>

				<div className="upwork-stats-nudge__body">
					<div className="upwork-stats-nudge__image-wrapper">
						<img
							className="upwork-stats-nudge__image"
							src="/calypso/images/upwork/illustration-builder-referral.svg"
							alt={ translate( 'Build your dream site with Upwork' ) }
						/>
					</div>

					<div className="upwork-stats-nudge__info">
						<h1 className="upwork-stats-nudge__title">
							{ translate( 'Need an expert to help realize your vision? Hire one!' ) }
						</h1>
						<p>
							{ translate(
								"We've partnered with Upwork, a network of freelancers with a huge pool of WordPress experts. They know their stuff and they're waiting to help you build your dream site."
							) }
						</p>
						<div className="upwork-stats-nudge__button-row">
							<Button
								href={ '/experts/upwork?source=stat-banner' }
								primary={ this.props.primaryButton }
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
		isDismissed: isUpworkStatsNudgeDismissed( state, ownProps.siteId ),
		plan: getCurrentPlan( state, ownProps.siteId ),
	} ),
	{
		dismissNudge,
		recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
	}
)( localize( UpworkStatsNudge ) );
