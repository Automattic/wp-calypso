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
		allowRestore: PropTypes.bool.isRequired,
		applySiteOffset: PropTypes.func.isRequired,
		isRewindActive: PropTypes.bool,
		logs: PropTypes.array.isRequired,
		requestRestore: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		tsEndOfSiteDay: PropTypes.number.isRequired,
	};

	static defaultProps = {
		allowRestore: true,
		isRewindActive: true,
	};

	handleClickRestore = () => {
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

		recordTracksEvent( 'calypso_activity_log_day_expand', {
			logCount: logs.length,
			tsEndOfSiteDay,
			utcDate: moment.utc( tsEndOfSiteDay ).format( 'YYYY-MM-DD' ),
		} );
	};

	/**
	 * Return a button to rewind to this point.
	 *
	 * @param {string} type Whether the button will be a primary or not.
	 * @returns { object } Button to display.
	 */
	getRewindButton( type = '' ) {
		const { allowRestore } = this.props;

		if ( ! allowRestore ) {
			return null;
		}

		return (
			<Button
				className="activity-log-day__rewind-button"
				compact
				disabled={ ! this.props.isRewindActive }
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
			allowRestore,
			logs,
			requestRestore,
			siteId,
			applySiteOffset,
		} = this.props;

		return (
			<div className="activity-log-day">
				<FoldableCard
					expandedSummary={ this.getRewindButton() }
					header={ this.getEventsHeading() }
					onOpen={ this.trackOpenDay }
					summary={ this.getRewindButton( 'primary' ) }
				>
					{ logs.map( ( log, index ) => (
						<ActivityLogItem
							key={ index }
							allowRestore={ allowRestore }
							siteId={ siteId }
							requestRestore={ requestRestore }
							log={ log }
							applySiteOffset={ applySiteOffset }
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
