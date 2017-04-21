/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import Button from 'components/button';
import ActivityLogItem from '../activity-log-item';

const ActivityLogDate = React.createClass( {

	/**
	 * Return a button to rewind to this point.
	 *
	 * @param {string} type Whether the button will be a primary or not.
	 * @returns { object } Button to display.
	 */
	getRewindButton( type = '' ) {
		return (
			<Button primary={ 'primary' === type } compact>
				<Gridicon icon={ 'history' } size={ 18 } /> {
				this.props.translate( 'Rewind to this day' )
			}
			</Button>
		);
	},

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
	},

	render() {
		const {
			logs
		} = this.props;

		return (
			<div className="activity-log-date">
				<FoldableCard
					header={ this.getEventsHeading() }
					summary={ this.getRewindButton( 'primary' ) }
					expandedSummary={ this.getRewindButton() }
				>
					{ logs.map( ( log, index )  => {
						return <ActivityLogItem
							title={ log.title }
							subTitle={ log.subTitle }
							description={ log.description }
							icon={ log.icon }
							timestamp={ log.timestamp }
							user={ log.user }
							actionText={ log.actionText }
							status={ log.status }
							className={ log.className }
							key={ 'activity-log' + index } />
					} ) }
				</FoldableCard>
			</div>
		);
	}
} );

export default localize( ActivityLogDate );
