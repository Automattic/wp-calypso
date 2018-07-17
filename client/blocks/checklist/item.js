/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { launchTask } from 'my-sites/checklist/onboardingChecklist';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getChecklistTask from 'state/selectors/get-checklist-task';
import Item from 'components/checklist/item';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';

export class ConnectedItem extends PureComponent {
	static propTypes = {
		completed: PropTypes.bool,
		siteId: PropTypes.number.isRequired,
		taskId: PropTypes.string.isRequired,
		tourId: PropTypes.string.isRequired,
		tourUrl: PropTypes.string.isRequired,
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
		return (
			<Item
				buttonPrimary={ this.props.buttonPrimary }
				completed={ this.props.completed }
				completedButtonText={ this.props.completedButtonText }
				completedTitle={ this.props.completedTitle }
				description={ this.props.description }
				duration={ this.props.duration }
				title={ this.props.title }
				onClick={ this.handleClick }
				onDismiss={ this.handleToggle }
			/>
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
)( ConnectedItem );
