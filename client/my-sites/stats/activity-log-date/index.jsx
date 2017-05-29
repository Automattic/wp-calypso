/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import Button from 'components/button';
import ActivityLogItem from '../activity-log-item';

class ActivityLogDate extends Component {

	getInitialState() {
		return {
			timestamp: this.props.logs[ 0 ].timestamp
		};
	}

	/**
	 * Return a button to rewind to this point.
	 *
	 * @param {int} timestamp The index of the backup to restore.
	 * @param {string} type Whether the button will be a primary or not.
	 * @returns { object } Button to display.
	 */
	getRewindButton( timestamp, type = '' ) {
		return (
			<Button
				primary={ 'primary' === type }
				disabled={ ! this.props.isRewindEnabled }
				compact
				onClick={ this.requestRestore }
				className={ this.props.isRestoring( timestamp )
					? 'is-busy'
					: ''
				}
			>
				<Gridicon icon={ 'history' } size={ 18 } /> {
				this.props.translate( 'Rewind to this day' )
			}
			</Button>
		);
	}

	requestRestore() {
		this.props.requestRestore( this.props.siteId, this.state.timestamp );
	}

	/**
	 * Return a heading that serves as parent for many events.
	 *
	 * @returns { object } Heading to display with date and number of events
	 */
	getEventsHeading() {
		const {
			logs,
			moment,
			translate
		} = this.props;
		return (
			<div>
				<div className="activity-log-date__day">{ moment( logs[ 0 ].timestamp ).format( 'LL' )}</div>
				<div className="activity-log-date__events"> { logs.length } { translate( 'Events' ) }</div>
			</div>
		);
	}

	render() {
		const {
			logs
		} = this.props;
		const mostRecentBackup = logs[ 0 ].timestamp;

		return (
			<div className="activity-log-date">
				<FoldableCard
					header={ this.getEventsHeading() }
					summary={ this.getRewindButton( mostRecentBackup, 'primary' ) }
					expandedSummary={ this.getRewindButton( mostRecentBackup ) }
				>
					{ logs.map( ( log, index ) => {
						return (
							<ActivityLogItem
								key={ 'activity-log' + index }
								title={ log.title }
								subTitle={ log.subTitle }
								description={ log.description }
								icon={ log.icon }
								siteId={ this.props.siteId }
								timestamp={ log.timestamp }
								user={ log.user }
								actionText={ log.actionText }
								status={ log.status }
								className={ log.className }
								requestRestore={ this.props.requestRestore }
							/>
						);
					} ) }
				</FoldableCard>
			</div>
		);
	}
}

export default localize( ActivityLogDate );
