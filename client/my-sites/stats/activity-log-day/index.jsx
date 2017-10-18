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
import { map, findKey, get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogItem from '../activity-log-item';
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';
import { withAnalytics as withAnalyticsAction } from 'state/analytics/actions';
import { getRequestedRewind } from 'state/selectors';
import { rewindRequestDismiss as rewindRequestDismissAction } from 'state/activity-log/actions';
import { rewriteStream } from 'state/activity-log/log/is-discarded';

/**
 * Module constants
 */
const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

/**
 * Check that the object passed is the Rewind dialog.
 *
 * @param {object} item Can be a regular object or a React element.
 * @returns {boolean} True if this is the React element for the Rewind dialog.
 */
const isRewindDialog = ( { key } ) => 'activity-rewind-dialog' === key;

class ActivityLogDay extends Component {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		disableRestore: PropTypes.bool.isRequired,
		hideRestore: PropTypes.bool,
		isRewindActive: PropTypes.bool,
		logs: PropTypes.array.isRequired,
		requestedRestoreActivityId: PropTypes.string,
		requestRestore: PropTypes.func.isRequired,
		rewindConfirmDialog: PropTypes.element,
		siteId: PropTypes.number,
		tsEndOfSiteDay: PropTypes.number.isRequired,

		// Connected props
		isToday: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		requestedRewind: PropTypes.string,
		rewindRequestDismiss: PropTypes.func.isRequired,
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
		const { logs, requestRestore } = this.props;
		const lastLogId = get( logs, [ 0, 'activityId' ], null );
		if ( lastLogId ) {
			requestRestore( lastLogId, 'day' );
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

	closeDayAndRewindDialog = () => {
		const { trackRewindCancel, rewindRequestDismiss, siteId } = this.props;
		trackRewindCancel( siteId );
		rewindRequestDismiss( siteId );
		this.closeDayOnly();
	};

	handleCloseDay = hasConfirmDialog =>
		hasConfirmDialog ? this.closeDayAndRewindDialog : this.closeDayOnly;

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
				{ this.props.translate( 'Rewind {{em}}to this day{{/em}}', {
					components: { em: <em /> },
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
			isToday,
			logs,
			requestedRestoreActivityId,
			requestRestore,
			rewindConfirmDialog,
			siteId,
			tsEndOfSiteDay,
		} = this.props;

		const rewindHere = this.state.rewindHere;
		const dayExpanded = this.state.dayExpanded ? true : rewindHere;

		const hasConfirmDialog = logs.some(
				( { activityId, activityTs } ) =>
					activityId === requestedRestoreActivityId &&
					( tsEndOfSiteDay - DAY_IN_MILLISECONDS <= activityTs && activityTs <= tsEndOfSiteDay )
			);

		const rewindButton = this.renderRewindButton( hasConfirmDialog ? '' : 'primary' );
		const elementsInDay = rewriteStream( logs );

		// Include the Rewind dialog in the right place in the collection
		if ( hasConfirmDialog ) {
			elementsInDay.splice(
				findKey( elementsInDay, [ 'activityId', requestedRestoreActivityId ] ),
				0,
				rewindConfirmDialog
			);
		}

		return (
			<div
				className={ classNames( 'activity-log-day', {
					'has-rewind-dialog': hasConfirmDialog,
				} ) }
			>
				<FoldableCard
					clickableHeader={ true }
					expanded={ isToday || dayExpanded }
					expandedSummary={ rewindButton }
					summary={ rewindButton }
					header={ this.renderEventsHeading() }
					onOpen={ this.trackOpenDay }
					onClose={ this.handleCloseDay( hasConfirmDialog ) }
				>
					{ flatMap( rewriteStream( logs ), log => [
						map(
							elementsInDay,
							( elem, index, list ) =>
								isRewindDialog( elem ) ? (
									// If this is the Rewind dialog, insert it in timeline
									elem
								) : (
									// Otherwise it's a regular event
									<ActivityLogItem
										className={ classNames( {
											// Is this event right before the Rewind dialog?
											'is-before-dialog':
												index < list.length - 1 && isRewindDialog( list[ ++index ] ),
										} ) }
										applySiteOffset={ applySiteOffset }
										disableRestore={ disableRestore }
										hideRestore={ hideRestore }
										key={ elem.activityId }
										log={ elem }
										requestRestore={ requestRestore }
										siteId={ siteId }
									/>
								)
						) }
				</FoldableCard>
			</div>
		);
	}
}

export default connect(
	( state, { tsEndOfSiteDay, siteId } ) => {
		const now = Date.now();
		return {
			isToday: now <= tsEndOfSiteDay && tsEndOfSiteDay - DAY_IN_MILLISECONDS <= now,
			requestedRewind: getRequestedRewind( state, siteId ),
		};
	},
	{
		recordTracksEvent: recordTracksEventAction,
		rewindRequestDismiss: rewindRequestDismissAction,
		trackRewindCancel: siteId =>
			withAnalyticsAction(
				recordTracksEventAction( 'calypso_activitylog_restore_cancel' ),
				rewindRequestDismissAction( siteId )
			),
	}
)( localize( ActivityLogDay ) );
