/**
 * External dependencies
 */
import classnames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { isEmpty, map } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ActivityLogItem from '../activity-log-item';
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

/**
 * Module constants
 */
const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

class ActivityLogDay extends Component {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		disableRestore: PropTypes.bool.isRequired,
		hideRestore: PropTypes.bool,
		isRewindActive: PropTypes.bool,
		logs: PropTypes.array.isRequired,
		requestRestore: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		tsEndOfSiteDay: PropTypes.number.isRequired,

		// Connected props
		isToday: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
	};

	static defaultProps = {
		disableRestore: false,
		isRewindActive: true,
	};

	handleClickRestore = ( event ) => {
		event.stopPropagation();
		const {
			tsEndOfSiteDay,
			requestRestore,
		} = this.props;
		requestRestore( tsEndOfSiteDay, 'day' );
	};

	trackOpenDay = () => {
		const {
			logs,
			moment,
			recordTracksEvent,
			tsEndOfSiteDay,
		} = this.props;

		recordTracksEvent( 'calypso_activitylog_day_expand', {
			log_count: logs.length,
			ts_end_site_day: tsEndOfSiteDay,
			utc_date: moment.utc( tsEndOfSiteDay ).format( 'YYYY-MM-DD' ),
		} );
	};

	/**
	 * Return a button to rewind to this point.
	 *
	 * @param {string} type Whether the button will be a primary or not.
	 * @returns { object } Button to display.
	 */
	renderRewindButton( type = '' ) {
		const {
			disableRestore,
			hideRestore,
			isToday,
		} = this.props;

		if ( hideRestore || isToday ) {
			return null;
		}

		return (
			<Button
				className="activity-log-day__rewind-button"
				compact
				disabled={ disableRestore || ! this.props.isRewindActive }
				onClick={ this.handleClickRestore }
				primary={ 'primary' === type }
			>
				<Gridicon icon="history" size={ 18 } />
				{ ' ' }
				{ this.props.translate( 'Rewind to this day' ) }
			</Button>
		);
	}

	/**
	 * Return a heading that serves as parent for many events.
	 *
	 * @returns { object } Heading to display with date and number of events
	 */
	renderEventsHeading() {
		const {
			applySiteOffset,
			isToday,
			logs,
			moment,
			translate,
			tsEndOfSiteDay,
		} = this.props;

		const formattedDate = applySiteOffset( moment.utc( tsEndOfSiteDay ) ).format( 'LL' );
		const noActivityText = isToday ? translate( 'No activity yet!' ) : translate( 'No activity' );

		return (
			<div>
				<div className="activity-log-day__day">
					{ isToday
						? translate( '%s — Today', {
							args: formattedDate,
							comment: 'Long date with today indicator, i.e. "January 1, 2017 — Today"',
						} )
						: formattedDate }
				</div>
				<div className="activity-log-day__events">
					{ isEmpty( logs )
						? noActivityText
						: translate( '%d Event', '%d Events', {
							args: logs.length,
							count: logs.length,
						} ) }
				</div>
			</div>
		);
	}

	render() {
		const {
			applySiteOffset,
			disableRestore,
			hideRestore,
			isToday,
			logs,
			requestRestore,
			siteId,
		} = this.props;

		const hasLogs = ! isEmpty( logs );

		return (
			<div className={ classnames( 'activity-log-day', { 'is-empty': ! hasLogs } ) }>
				<FoldableCard
					clickableHeader={ hasLogs }
					expanded={ hasLogs && isToday }
					expandedSummary={ hasLogs ? this.renderRewindButton() : null }
					header={ this.renderEventsHeading() }
					onOpen={ this.trackOpenDay }
					summary={ hasLogs ? this.renderRewindButton( 'primary' ) : null }
				>
					{ hasLogs &&
						map( logs, log =>
							<ActivityLogItem
								applySiteOffset={ applySiteOffset }
								disableRestore={ disableRestore }
								hideRestore={ hideRestore }
								key={ log.activityId }
								log={ log }
								requestRestore={ requestRestore }
								siteId={ siteId }
							/>
						) }
				</FoldableCard>
			</div>
		);
	}
}

export default connect(
	( state, { tsEndOfSiteDay } ) => {
		const now = Date.now();
		return {
			isToday: now <= tsEndOfSiteDay && tsEndOfSiteDay - DAY_IN_MILLISECONDS <= now,
		};
	},
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( localize( ActivityLogDay ) );
