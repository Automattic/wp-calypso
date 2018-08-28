/** @format */

/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Checklist from 'components/checklist';
import Task from 'components/checklist/task';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import { getSiteSlug } from 'state/sites/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { getTaskUrls, launchTask, getTasks } from '../onboardingChecklist';
import { recordTracksEvent } from 'state/analytics/actions';
import { createNotice } from 'state/notices/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import QueryPosts from 'components/data/query-posts';
import { getSitePosts } from 'state/posts/selectors';

class ChecklistShow extends PureComponent {
	isComplete( taskId ) {
		return get( this.props.taskStatuses, [ taskId, 'completed' ], false );
	}

	handleTaskStart = task => () => {
		const { requestTour, siteSlug, track, taskUrls } = this.props;
		launchTask( {
			task: {
				...task,
				completed: task.completed || this.isComplete( task.id ),
				url: taskUrls[ task.id ] || task.url,
			},
			location: 'checklist_show',
			requestTour,
			siteSlug,
			track,
		} );
	};

	handleTaskDismiss = task => () => {
		const { notify, siteId, update } = this.props;

		if ( task ) {
			notify( 'is-success', 'You completed a task!' );
			update( siteId, task.id );
		}
	};

	render() {
		const { siteId, taskStatuses, tasks } = this.props;

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ siteId && (
					<QueryPosts
						siteId={ siteId }
						query={ { type: 'any', number: 10, order_by: 'ID', order: 'ASC' } }
					/>
				) }
				<Checklist isPlaceholder={ ! taskStatuses }>
					{ tasks.map( task => (
						<Task
							buttonPrimary={ task.buttonPrimary }
							buttonText={ task.buttonText }
							completed={ task.completed || this.isComplete( task.id ) }
							completedButtonText={ task.completedButtonText }
							completedTitle={ task.completedTitle }
							description={ task.description }
							duration={ task.duration }
							key={ task.id }
							onClick={ this.handleTaskStart( task ) }
							onDismiss={ this.handleTaskDismiss( task ) }
							title={ task.title }
						/>
					) ) }
				</Checklist>
			</Fragment>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
		taskUrls: getTaskUrls( getSitePosts( state, siteId ) ),
		tasks: getTasks( state, siteId ),
	};
};

const mapDispatchToProps = {
	track: recordTracksEvent,
	notify: createNotice,
	requestTour: requestGuidedTour,
	update: requestSiteChecklistTaskUpdate,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( ChecklistShow ) );
