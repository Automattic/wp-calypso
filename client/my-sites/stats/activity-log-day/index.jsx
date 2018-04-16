/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogItem from '../activity-log-item';
import FoldableCard from 'components/foldable-card';
import { recordTracksEvent } from 'state/analytics/actions';
import { getRequestedRewind } from 'state/selectors';

/**
 * Module constants
 */
const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

class ActivityLogDay extends Component {
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
			disableBackup,
			disableRestore,
			isRewindActive,
			isToday,
			logs,
			requestedBackupId,
			requestedRestoreId,
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
				{ logs.map( log => (
					<ActivityLogItem
						key={ log.activityId }
						activityId={ log.activityId }
						disableRestore={ disableRestore }
						disableBackup={ disableBackup }
						hideRestore={ ! isRewindActive }
						siteId={ siteId }
					/>
				) ) }
			</FoldableCard>
		);
	}
}

export default localize(
	connect(
		( state, { logs, siteId } ) => {
			const requestedRestoreId = getRequestedRewind( state, siteId );

			return {
				logs,
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
