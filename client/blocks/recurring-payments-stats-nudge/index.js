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
import Button from 'components/button';
import Card from 'components/card';
import isRecurringPaymentsStatsNudgeDismissed from 'state/selectors/is-recurring-payments-stats-nudge-dismissed';
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

class RecurringPaymentsStatsNudge extends Component {
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
			this.props.recordTracksEvent( 'calypso_recurring_payments_stats_nudge_view' );
		}
	}

	recordClick = eventName => {
		const plan = this.props.plan ? this.props.plan.productSlug : '';

		this.props.recordTracksEvent( eventName, { plan } );
	};

	onDismissClick = () => {
		this.recordClick( 'calypso_recurring_payments_stats_nudge_dismiss_icon_click' );
		this.props.dismissNudge();
	};

	onStartNowClick = () => {
		this.recordClick( 'calypso_recurring_payments_stats_nudge_start_now_button_click' );
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
			<Card className="recurring-payments-stats-nudge">
				<QueryPreferences />

				<Gridicon
					icon="cross"
					className="recurring-payments-stats-nudge__close-icon"
					onClick={ this.onDismissClick }
				/>

				<SectionHeader
					className="recurring-payments-stats-nudge__header"
					label={ translate( 'Recommendations from WordPress.com' ) }
				/>

				<div className="recurring-payments-stats-nudge__body">
					<div className="recurring-payments-stats-nudge__image-wrapper">
						<img
							className="recurring-payments-stats-nudge__image"
							src="/calypso/images/earn/earn-section.svg"
							alt={ translate( 'Collect recurring revenue with Recurring Payments' ) }
						/>
					</div>

					<div className="recurring-payments-stats-nudge__info">
						<h1 className="recurring-payments-stats-nudge__title">
							{ translate( "There's a new way to Earn on WordPress.com" ) }
						</h1>
						<p>
							{ translate(
								'Use Recurring Payments to collect regular monthly or yearly contributions from your customers and fans.'
							) }
						</p>
						<p>{ translate( 'Sustain your work and your site with a reliable income stream!' ) }</p>
						<div className="recurring-payments-stats-nudge__button-row">
							<Button
								href={ `/earn/payments/${ this.props.siteSlug }` }
								primary={ this.props.primaryButton }
								onClick={ this.onStartNowClick }
							>
								{ translate( 'Set Up Recurring Payments' ) }
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
		isDismissed: isRecurringPaymentsStatsNudgeDismissed( state, ownProps.siteId ),
		plan: getCurrentPlan( state, ownProps.siteId ),
	} ),
	{
		dismissNudge,
		recordTracksEvent: withEnhancers( recordTracksEvent, [ enhanceWithSiteType ] ),
	}
)( localize( RecurringPaymentsStatsNudge ) );
