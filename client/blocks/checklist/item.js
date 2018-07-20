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
import ItemComponent from 'components/checklist/item';
import { getSiteSlug } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';

export class Item extends PureComponent {
	static propTypes = {
		completed: PropTypes.bool,
		id: PropTypes.string.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		tourSlug: PropTypes.string,
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
				id: this.props.id,
				tour: this.props.tourSlug,
				url: this.props.tourUrl,
			},
			location: 'checklist_show',
			requestTour: this.props.requestGuidedTour,
			siteSlug: this.props.siteSlug,
			track: this.props.recordTracksEvent,
		} );

	handleToggle = () =>
		void this.props.requestSiteChecklistTaskUpdate( this.props.siteId, this.props.id );

	render() {
		return (
			<ItemComponent
				buttonPrimary={ this.props.buttonPrimary }
				completed={ this.props.completed }
				completedButtonText={ this.props.completedButtonText }
				completedTitle={ this.props.completedTitle }
				description={ this.props.description }
				duration={ this.props.duration }
				title={ this.props.title }
				onClick={ this.props.tourSlug && this.props.tourUrl ? this.handleClick : null }
				onDismiss={ this.handleToggle }
			/>
		);
	}
}

export default connect(
	( state, { completed, id, siteId } ) => ( {
		completed: typeof completed !== 'undefined' ? completed : getChecklistTask( state, siteId, id ),

		// Only needed for launchTask. Move somewhere else
		siteSlug: getSiteSlug( state, siteId ),
	} ),
	{
		recordTracksEvent,
		requestGuidedTour,
		requestSiteChecklistTaskUpdate,
	}
)( Item );
