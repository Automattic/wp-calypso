/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { compact, flatMap, get, isEmpty, zip } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogItem from '../activity-log-item';
import FoldableCard from 'components/foldable-card';
import { recordTracksEvent } from 'state/analytics/actions';
import { getActivityLog, getRewindEvents } from 'state/selectors';
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
 * @param {?Number} backupId selected backup operation
 * @param {?Number} restoreId selected rewind operation
 * @returns {Array<String, ?Object>} pairs of [ classifier, event ]
 */
const classifyEvents = ( logs, { backupId = null, rewindId = null } ) =>
	// the zip pairs up each log item with the following log item in the stream or undefined if at end
	flatMap( zip( logs, logs.slice( 1 ) ), ( [ log, nextLog = {} ] ) =>
		compact( [
			log.activityId === rewindId && [ 'rewind-confirm-dialog', {} ],
			log.activityId === backupId && [ 'backup-confirm-dialog', {} ],
			[ nextLog.activityId === rewindId ? 'timeline-break-event' : 'event', log ],
		] )
	);

class ActivityLogDay extends Component {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		disableRestore: PropTypes.bool.isRequired,
		disableBackup: PropTypes.bool.isRequired,
		isRewindActive: PropTypes.bool,
		logs: PropTypes.array.isRequired,
		requestedRestoreId: PropTypes.string,
		requestedBackupId: PropTypes.string,
		requestDialog: PropTypes.func.isRequired,
		closeDialog: PropTypes.func.isRequired,
		restoreConfirmDialog: PropTypes.element,
		backupConfirmDialog: PropTypes.element,
		siteId: PropTypes.number,
		tsEndOfSiteDay: PropTypes.number.isRequired,

		// Connected props
		isToday: PropTypes.bool.isRequired,
		trackOpenDay: PropTypes.func.isRequired,
	};

	static defaultProps = {
		disableRestore: false,
		disableBackup: false,
		isRewindActive: true,
	};

	state = {
		rewindHere: false,
		dayExpanded: false,
	};

	componentWillReceiveProps( nextProps ) {
		// if Rewind dialog is being displayed and it's then canceled or a different Rewind button is clicked
		if ( this.state.rewindHere && this.props.requestedRestoreId !== nextProps.requestedRestoreId ) {
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

	handleOpenDay = () =>
		this.setState(
			{
				dayExpanded: true,
			},
			this.props.trackOpenDay
		);

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
			disableBackup,
			isRewindActive,
			isToday,
			logs,
			requestedRestoreId,
			requestedBackupId,
			requestDialog,
			restoreConfirmDialog,
			backupConfirmDialog,
			siteId,
			tsEndOfSiteDay,
		} = this.props;

		const rewindHere = this.state.rewindHere;
		const dayExpanded = this.state.dayExpanded ? true : rewindHere;
		const requestedActionId = requestedRestoreId || requestedBackupId;
		const hasConfirmDialog = logs.some(
			( { activityId, activityTs } ) =>
				activityId === requestedActionId &&
				( tsEndOfSiteDay <= activityTs && activityTs < tsEndOfSiteDay + DAY_IN_MILLISECONDS )
		);

		const events = classifyEvents( logs, {
			backupId: requestedBackupId,
			rewindId: requestedRestoreId,
		} );

		const LogItem = ( { log, hasBreak } ) => (
			<ActivityLogItem
				className={ hasBreak ? 'is-before-dialog' : '' }
				applySiteOffset={ applySiteOffset }
				disableRestore={ disableRestore }
				disableBackup={ disableBackup }
				hideRestore={ ! isRewindActive }
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
				header={ this.renderEventsHeading() }
				onOpen={ this.handleOpenDay }
				onClose={ this.handleCloseDay( hasConfirmDialog ) }
			>
				{ events.map( ( [ type, log ] ) => {
					const key = log.activityId;

					switch ( type ) {
						case 'backup-confirm-dialog':
							return backupConfirmDialog;

						case 'event':
							return <LogItem { ...{ key, log } } />;

						case 'timeline-break-event':
							return <LogItem { ...{ key, log, hasBreak: true } } />;

						case 'rewind-confirm-dialog':
							return restoreConfirmDialog;
					}
				} ) }
			</FoldableCard>
		);
	}
}

export default localize(
	connect(
		( state, { logs, siteId, requestedRestoreId } ) => {
			const rewindEvents = getRewindEvents( state, siteId );
			const isDiscardedPerspective = requestedRestoreId
				? new Date( ms( getActivityLog( state, siteId, requestedRestoreId ).activityTs ) )
				: undefined;

			return {
				logs: rewriteStream( logs, rewindEvents, isDiscardedPerspective ),
				requestedRestoreId,
			};
		},
		( dispatch, { logs, tsEndOfSiteDay, moment } ) => ( {
			trackOpenDay: () =>
				dispatch(
					recordTracksEvent( 'calypso_activitylog_day_expand', {
						log_count: logs.length,
						ts_end_site_day: tsEndOfSiteDay,
						utc_date: moment.utc( tsEndOfSiteDay ).format( 'YYYY-MM-DD' ),
					} )
				),
		} )
	)( ActivityLogDay )
);
