/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flatMap, get, isEmpty, zip } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogItem from '../activity-log-item';
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { getActivityLog, getRequestedRewind } from 'state/selectors';
import { ms, rewriteStream } from 'state/activity-log/log/is-discarded';

/**
 * Module constants
 */
const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

/**
 * Classifies events in a sorted list into pairs of a
 * classifier and the event itself (for rendering)
 *
 * @param {Array} logs sorted activity log items
 * @param {Number} activityId selected rewind operation
 * @returns {Array<String, ?Object>} pairs of [ classifier, event ]
 */
const classifyEvents = ( logs, activityId ) => {
	/** @type {Array<Array<Object, ?Object>>} contains pairs of [ log, next log ] **/
	const logPairs = zip( logs, logs.slice( 1 ) );

	return flatMap( logPairs, ( [ log, nextLog ] ) => {
		if ( log.activityId === activityId ) {
			return [ [ 'rewind-confirm-dialog', {} ], [ 'event', log ] ];
		}

		if ( nextLog && nextLog.activityId === activityId ) {
			return [ [ 'event-before-dialog', log ] ];
		}

		return [ [ 'event', log ] ];
	} );
};

class ActivityLogDay extends Component {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		disableRestore: PropTypes.bool.isRequired,
		hideRestore: PropTypes.bool,
		isRewindActive: PropTypes.bool,
		logs: PropTypes.array.isRequired,
		requestedRestoreActivityId: PropTypes.string,
		requestDialog: PropTypes.func.isRequired,
		closeDialog: PropTypes.func.isRequired,
		restoreConfirmDialog: PropTypes.element,
		backupConfirmDialog: PropTypes.element,
		siteId: PropTypes.number,
		tsEndOfSiteDay: PropTypes.number.isRequired,

		// Connected props
		isToday: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		requestedRewind: PropTypes.string,
	};

	static defaultProps = {
		disableRestore: false,
		isRewindActive: true,
	};

	state = {
		rewindHere: false,
		dayExpanded: false,
	};

	componentWillReceiveProps( nextProps ) {
		// if Rewind dialog is being displayed and it's then canceled or a different Rewind button is clicked
		if ( this.state.rewindHere && this.props.requestedRewind !== nextProps.requestedRewind ) {
			this.setState( {
				rewindHere: false,
			} );
		}
	}

	handleClickRestore = event => {
		event.stopPropagation();
		this.setState( {
			rewindHere: true,
			dayExpanded: true,
		} );
		const { logs, requestDialog } = this.props;
		const lastLogId = get( logs, [ 0, 'activityId' ], null );
		if ( lastLogId ) {
			requestDialog( lastLogId, 'day', 'restore' );
		}
	};

	trackOpenDay = () => {
		const { logs, moment, recordTracksEvent, tsEndOfSiteDay } = this.props;

		recordTracksEvent( 'calypso_activitylog_day_expand', {
			log_count: logs.length,
			ts_end_site_day: tsEndOfSiteDay,
			utc_date: moment.utc( tsEndOfSiteDay ).format( 'YYYY-MM-DD' ),
		} );

		this.setState( {
			dayExpanded: true,
		} );
	};

	closeDayOnly = () =>
		this.setState( {
			rewindHere: false,
			dayExpanded: false,
		} );

	closeDayAndDialogs = () => {
		const { closeDialog } = this.props;
		closeDialog( 'restore' );
		closeDialog( 'backup' );
		this.closeDayOnly();
	};

	handleCloseDay = hasConfirmDialog =>
		hasConfirmDialog ? this.closeDayAndDialogs : this.closeDayOnly;

	/**
	 * Return a button to rewind to this point.
	 *
	 * @param {string} type Whether the button will be a primary or not.
	 * @returns { object } Button to display.
	 */
	renderRewindButton( type = '' ) {
		const { disableRestore, hideRestore, isToday } = this.props;

		if ( hideRestore || isToday ) {
			return null;
		}

		return (
			<Button
				className="activity-log-day__rewind-button"
				compact
				disabled={ disableRestore || ! this.props.isRewindActive || this.state.rewindHere }
				onClick={ this.handleClickRestore }
				primary={ 'primary' === type }
			>
				<Gridicon icon="history" size={ 18 } />{' '}
				{ this.props.translate( 'Rewind {{span}}to this day{{/span}}', {
					components: { span: <span className="activity-log-day__rewind-button-extra-text" /> },
				} ) }
			</Button>
		);
	}

	/**
	 * Return a heading that serves as parent for many events.
	 *
	 * @returns { object } Heading to display with date and number of events
	 */
	renderEventsHeading() {
		const { applySiteOffset, isToday, logs, moment, translate, tsEndOfSiteDay } = this.props;

		const formattedDate = applySiteOffset( moment.utc( tsEndOfSiteDay ) ).format( 'LL' );
		const noActivityText = isToday ? translate( 'No activity yet!' ) : translate( 'No activity' );

		return (
			<div>
				<div className="activity-log-day__day">
					{ isToday ? (
						translate( '%s — Today', {
							args: formattedDate,
							comment: 'Long date with today indicator, i.e. "January 1, 2017 — Today"',
						} )
					) : (
						formattedDate
					) }
				</div>
				<div className="activity-log-day__events">
					{ isEmpty( logs ) ? (
						noActivityText
					) : (
						translate( '%d Event', '%d Events', {
							args: logs.length,
							count: logs.length,
						} )
					) }
				</div>
			</div>
		);
	}

	render() {
		const {
			applySiteOffset,
			disableRestore,
			hideRestore,
			isDiscardedPerspective,
			isToday,
			logs,
			requestedRestoreActivityId,
			requestedBackupId,
			requestDialog,
			restoreConfirmDialog,
			backupConfirmDialog,
			siteId,
			tsEndOfSiteDay,
		} = this.props;

		const rewindHere = this.state.rewindHere;
		const dayExpanded = this.state.dayExpanded ? true : rewindHere;
		const requestedActionId = requestedRestoreActivityId || requestedBackupId;
		const hasConfirmDialog = logs.some(
			( { activityId, activityTs } ) =>
				activityId === requestedActionId &&
				( tsEndOfSiteDay <= activityTs && activityTs < tsEndOfSiteDay + DAY_IN_MILLISECONDS )
		);

		const rewindButton = this.renderRewindButton( hasConfirmDialog ? '' : 'primary' );
		const events = classifyEvents( rewriteStream( logs, isDiscardedPerspective ), requestedRestoreActivityId );

		const LogItem = ( { log, hasBreak } ) => (
			<ActivityLogItem
				className={ hasBreak ? 'is-before-dialog' : '' }
				applySiteOffset={ applySiteOffset }
				disableRestore={ disableRestore }
				hideRestore={ hideRestore }
				log={ log }
				requestDialog={ requestDialog }
				siteId={ siteId }
			/>
		);

		return (
			<FoldableCard
				className={ classNames( 'activity-log-day', {
					'has-rewind-dialog': hasConfirmDialog,
				} ) }
				clickableHeader={ true }
				expanded={ isToday || dayExpanded }
				expandedSummary={ rewindButton }
				summary={ rewindButton }
				header={ this.renderEventsHeading() }
				onOpen={ this.trackOpenDay }
				onClose={ this.handleCloseDay( hasConfirmDialog ) }
			>
				{ events.map( ( [ type, log ] ) => {
					const key = log.activityId;

					switch ( type ) {
						case 'event':
							return <LogItem { ...{ key, log } } />;

						case 'event-before-dialog':
							return <LogItem { ...{ key, log, hasBreak: true } } />;

						case 'rewind-confirm-dialog':
							return rewindConfirmDialog;
					}
				} ) }
			</FoldableCard>
		);
	}
}

export default connect(
	( state, { siteId } ) => {
		const requestedRewind = getRequestedRewind( state, siteId );
		const isDiscardedPerspective = requestedRewind
			? new Date( ms( getActivityLog( state, siteId, requestedRewind ).activityTs ) )
			: undefined;

		return {
			isDiscardedPerspective,
			requestedRewind,
		};
	},
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( localize( ActivityLogDay ) );
