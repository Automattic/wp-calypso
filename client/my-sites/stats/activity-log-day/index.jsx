/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ActivityLogConfirmDialog from '../activity-log-confirm-dialog';
import FoldableCard from 'components/foldable-card';
import Button from 'components/button';
import ActivityLogItem from '../activity-log-item';

class ActivityLogDay extends Component {
	static propTypes = {
		isRewindEnabled: PropTypes.bool,
		logs: PropTypes.array.isRequired,
		siteId: PropTypes.number,
		dateIsoString: PropTypes.string.isRequired,
	};

	static defaultProps = {
		isRewindEnabled: true,
	};

	state = {
		isRestoreConfirmDialogOpen: false,
	};

	handleRestoreClick = () => this.setState( { isRestoreConfirmDialogOpen: true } );

	handleRestoreDialogClose = () => this.setState( { isRestoreConfirmDialogOpen: false } );

	// FIXME: Handle confirm correctly
	handleRestoreDialogConfirm = () => this.setState( { isRestoreConfirmDialogOpen: false } );

	/**
	 * Return a button to rewind to this point.
	 *
	 * @param {string} type Whether the button will be a primary or not.
	 * @returns { object } Button to display.
	 */
	getRewindButton( type = '' ) {
		return (
			<Button
				primary={ 'primary' === type }
				disabled={ ! this.props.isRewindEnabled }
				onClick={ this.handleRestoreClick }
				compact
			>
				<Gridicon icon="history" size={ 18 } />
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
			dateIsoString,
			logs,
			moment,
			translate,
		} = this.props;
		return (
			<div>
				<div className="activity-log-day__day">{ moment( dateIsoString ).format( 'LL' ) }</div>
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
			logs,
			dateIsoString,
		} = this.props;

		// FIXME get real props
		const siteName = 'Placeholder site name';

		return (
			<div className="activity-log-day">
				<FoldableCard
					header={ this.getEventsHeading() }
					summary={ this.getRewindButton( 'primary' ) }
					expandedSummary={ this.getRewindButton() }
				>
					{ logs.map( ( log, index ) => {
						return (
							<ActivityLogItem
								key={ index }
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
							/>
						);
					} ) }
				</FoldableCard>
				<ActivityLogConfirmDialog
					isVisible={ this.state.isRestoreConfirmDialogOpen }
					siteName={ siteName }
					dateIsoString={ dateIsoString }
					onClose={ this.handleRestoreDialogClose }
					onConfirm={ this.handleRestoreDialogConfirm }
				/>
			</div>
		);
	}
}

export default localize( ActivityLogDay );
