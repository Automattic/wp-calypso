/** @format */

/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, get, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import Checklist from 'components/checklist';
import Task from 'components/checklist/task';
import { tasks as jetpackTasks } from '../jetpack-checklist';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import { isJetpackSite, getSiteSlug } from 'state/sites/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { launchTask, tasks as wpcomTasks } from '../onboardingChecklist';
import { loadTrackingTool, recordTracksEvent } from 'state/analytics/actions';
import { createNotice } from 'state/notices/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

class ChecklistShow extends PureComponent {
	componentDidMount() {
		this.props.loadTrackingTool( 'HotJar' );
	}

	handleAction = id => () => {
		const { requestTour, siteSlug, tasks, track } = this.props;
		const task = find( tasks, { id } );

		launchTask( {
			task,
			location: 'checklist_show',
			requestTour,
			siteSlug,
			track,
		} );
	};

	handleToggle = id => () => {
		const { notify, siteId, tasks, update } = this.props;
		const task = find( tasks, { id } );

		if ( task && ! task.completed ) {
			notify( 'is-success', 'You completed a task!' );
			update( siteId, id );
		}
	};

	render() {
		const { isJetpack, siteId, taskStatuses } = this.props;
		const tasks = isJetpack ? jetpackTasks : wpcomTasks;

		const completed = reduce(
			tasks,
			( count, { id, completed: taskComplete } ) =>
				taskComplete || get( taskStatuses, [ id, 'completed' ], false ) ? count + 1 : count,
			0
		);

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<Checklist completedCount={ completed } isPlaceholder={ ! taskStatuses }>
					{ tasks.map( task => (
						<Task
							buttonPrimary={ task.buttonPrimary }
							buttonText={ task.buttonText }
							completed={ task.completed || get( taskStatuses, [ task.id, 'completed' ], false ) }
							completedButtonText={ task.completedButtonText }
							completedTitle={ task.completedTitle }
							description={ task.description }
							duration={ task.duration }
							id={ task.id }
							key={ task.id }
							onAction={ this.handleAction( task.id ) }
							onToggle={ this.handleToggle( task.id ) }
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
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ], null ),
	};
};

const mapDispatchToProps = {
	loadTrackingTool,
	track: recordTracksEvent,
	notify: createNotice,
	requestTour: requestGuidedTour,
	update: requestSiteChecklistTaskUpdate,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( ChecklistShow ) );
