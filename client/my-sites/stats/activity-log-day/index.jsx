/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import Button from 'components/button';
import ActivityLogItem from '../activity-log-item';

class ActivityLogDay extends Component {
	static propTypes = {
		allowRestore: PropTypes.bool.isRequired,
		isRewindActive: PropTypes.bool,
		logs: PropTypes.array.isRequired,
		requestRestore: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		timestamp: PropTypes.number.isRequired,
	};

	static defaultProps = {
		allowRestore: true,
		isRewindActive: true,
	};

	handleClickRestore = () => {
		const {
			requestRestore,
			timestamp,
		} = this.props;
		requestRestore( timestamp );
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
			logs,
			moment,
			timestamp,
			translate,
		} = this.props;

		return (
			<div>
				<div className="activity-log-day__day">{ moment( timestamp ).format( 'LL' ) }</div>
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
		} = this.props;

		return (
			<div className="activity-log-day">
				<FoldableCard
					header={ this.getEventsHeading() }
					summary={ this.getRewindButton( 'primary' ) }
					expandedSummary={ this.getRewindButton() }
				>
					{ logs.map( ( log, index ) => (
						<ActivityLogItem
							key={ index }
							allowRestore={ allowRestore }
							siteId={ siteId }
							requestRestore={ requestRestore }
							log={ log }
						/>
					) ) }
				</FoldableCard>
			</div>
		);
	}
}

export default localize( ActivityLogDay );
