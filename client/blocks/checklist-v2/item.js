/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { launchTask } from 'my-sites/checklist/onboardingChecklist';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import Focusable from 'components/focusable';
import getChecklistTask from 'state/selectors/get-checklist-task';
import ScreenReaderText from 'components/screen-reader-text';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

export class Item extends PureComponent {
	static propTypes = {
		completed: PropTypes.bool,
		siteId: PropTypes.number.isRequired,
		taskId: PropTypes.string.isRequired,
		tourId: PropTypes.string,
		tourUrl: PropTypes.string,
	};

	handleClick = () =>
		/**
		 * @TODO
		 *
		 * This should be a simpler dispatched action.
		 * Look at moving logic into middleware.
		 */
		void launchTask( {
			task: {
				completed: this.props.completed,
				id: this.props.taskId,
				tour: this.props.tourId,
				url: this.props.tourUrl,
			},
			location: 'checklist_show',
			requestTour: this.props.requestGuidedTour,
			siteSlug: this.props.siteSlug,
			track: this.props.recordTracksEvent,
		} );

	handleToggle = () =>
		void this.props.requestSiteChecklistTaskUpdate( this.props.siteId, this.props.taskId );

	render() {
		const {
			buttonPrimary,
			completed,
			completedTitle,
			completedButtonText,
			description,
			duration,
			title,
			translate,
		} = this.props;
		const { buttonText = translate( 'Do it!' ) } = this.props;
		const hasActionlink = completed && completedButtonText;

		return (
			<CompactCard
				className={ classNames( 'checklist-v2__item', 'checklist__task', {
					'is-completed': completed,
					'has-actionlink': hasActionlink,
				} ) }
			>
				<div className="checklist__task-primary">
					<h3 className="checklist__task-title">
						<Button borderless className="checklist__task-title-link" onClick={ this.handleClick }>
							{ ( completed && completedTitle ) || title }
						</Button>
					</h3>
					<p className="checklist__task-description">{ description }</p>
					{ duration && (
						<small className="checklist__task-duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<div className="checklist__task-secondary">
					<Button
						className="checklist__task-action"
						onClick={ this.handleClick }
						primary={ buttonPrimary }
					>
						{ hasActionlink ? completedButtonText : buttonText }
					</Button>
					{ duration && (
						<small className="checklist__task-duration">
							{ translate( 'Estimated time:' ) } { duration }
						</small>
					) }
				</div>
				<Focusable
					className="checklist__task-icon"
					onClick={ this.handleToggle }
					aria-pressed={ completed ? 'true' : 'false' }
				>
					<ScreenReaderText>
						{ completed ? translate( 'Mark as uncompleted' ) : translate( 'Mark as completed' ) }
					</ScreenReaderText>
					<Gridicon icon="checkmark" size={ 18 } />
				</Focusable>
			</CompactCard>
		);
	}
}

export default connect(
	( state, { siteId, completed, taskId } ) => ( {
		completed:
			typeof completed !== 'undefined' ? completed : getChecklistTask( state, siteId, taskId ),

		// Only needed for launchTask. Move somewhere else
		siteSlug: getSiteSlug( state, siteId ),
	} ),
	{
		recordTracksEvent,
		requestGuidedTour,
		requestSiteChecklistTaskUpdate,
	}
)( localize( Item ) );
