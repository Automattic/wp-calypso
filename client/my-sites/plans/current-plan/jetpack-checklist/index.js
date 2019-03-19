/** @format */

/**
 * External dependencies
 */
import page from 'page';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Checklist from 'components/checklist';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import Task from 'components/checklist/task';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { isDesktop } from 'lib/viewport';
import { JETPACK_CHECKLIST_TASKS } from './constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

class JetpackChecklist extends PureComponent {
	isComplete( taskId ) {
		return get( this.props.taskStatuses, [ taskId, 'completed' ], false );
	}

	handleTaskStart = ( { taskId, tourId, url } ) => () => {
		if ( ! tourId && ! url ) {
			return;
		}

		this.props.recordTracksEvent( 'calypso_checklist_task_start', {
			checklist_name: 'jetpack',
			location: 'JetpackChecklist',
			step_name: taskId,
		} );

		if ( tourId && ! this.isComplete( taskId ) && isDesktop() ) {
			this.props.requestGuidedTour( tourId );
		}

		if ( url ) {
			page.show( url );
		}
	};

	render() {
		const { siteId, siteSlug, taskStatuses, translate } = this.props;

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<Checklist
					isPlaceholder={ ! taskStatuses }
					progressText={ translate( 'Your Jetpack setup progress' ) }
				>
					<Task
						completed
						title={ translate(
							"We've automatically protected you from brute force login attacks."
						) }
					/>
					<Task completed title={ translate( "We've automatically turned on spam filtering." ) } />
					{ map( taskStatuses, ( status, taskId ) => {
						const task = JETPACK_CHECKLIST_TASKS[ taskId ];

						if ( ! task ) {
							// UI does not support this task yet.
							recordTracksEvent( 'calypso_jetpack_checklist_unsupported_task', {
								task_id: taskId,
								site_id: siteId,
							} );
							return;
						}

						return (
							<Task
								completed={ get( status, 'completed', false ) }
								completedButtonText={ task.completedButtonText }
								completedTitle={ task.completedTitle }
								description={ task.description }
								duration={ task.duration }
								onClick={ this.handleTaskStart( {
									taskId,
									url: task.getUrl( siteSlug ),
									tourId: get( task, 'tourId', null ),
								} ) }
								title={ task.title }
								key={ taskId }
							/>
						);
					} ) }
				</Checklist>
			</Fragment>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
			taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
		};
	},
	{
		recordTracksEvent,
		requestGuidedTour,
	}
)( localize( JetpackChecklist ) );
