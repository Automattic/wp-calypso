/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogItem from '../activity-log-item';
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

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
	getRewindButton( type = '' ) {
		const {
			disableRestore,
			hideRestore,
		} = this.props;

		if ( hideRestore ) {
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
	getEventsHeading() {
		const {
			applySiteOffset,
			logs,
			moment,
			translate,
			tsEndOfSiteDay,
		} = this.props;

		return (
			<div>
				<div className="activity-log-day__day">{ applySiteOffset( moment.utc( tsEndOfSiteDay ) ).format( 'LL' ) }</div>
				<div className="activity-log-day__events">{
					translate( '%d Event', '%d Events', {
						args: logs.length,
						count: logs.length,
					} )
				}</div>
			</div>
		);
	}

	render() {
		const {
			applySiteOffset,
			disableRestore,
			hideRestore,
			logs,
			requestRestore,
			siteId,
		} = this.props;

		return (
			<div className="activity-log-day">
				<FoldableCard
					clickableHeader
					expandedSummary={ this.getRewindButton() }
					header={ this.getEventsHeading() }
					onOpen={ this.trackOpenDay }
					summary={ this.getRewindButton( 'primary' ) }
				>
					{ logs.map( ( log, index ) => (
						<ActivityLogItem
							applySiteOffset={ applySiteOffset }
							disableRestore={ disableRestore }
							hideRestore={ hideRestore }
							key={ index }
							log={ log }
							requestRestore={ requestRestore }
							siteId={ siteId }
						/>
					) ) }
				</FoldableCard>
			</div>
		);
	}
}

export default connect( null, {
	recordTracksEvent: recordTracksEventAction,
} )( localize( ActivityLogDay ) );
