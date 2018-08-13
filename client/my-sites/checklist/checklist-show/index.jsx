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

	handleAction = task => () => {
		const { requestTour, siteSlug, track } = this.props;

		launchTask( {
			task,
			location: 'checklist_show',
			requestTour,
			siteSlug,
			track,
		} );
	};

	handleToggle = task => () => {
		const { notify, siteId, update } = this.props;

		if ( task && ! task.completed ) {
			notify( 'is-success', 'You completed a task!' );
			update( siteId, task.id );
		}
	};

	render() {
		const { isJetpack, siteId, taskStatuses } = this.props;
		const tasks = isJetpack ? jetpackTasks : wpcomTasks;

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<Checklist isPlaceholder={ ! taskStatuses }>
					{ tasks.map( task => (
						<Task
							buttonPrimary={ task.buttonPrimary }
							buttonText={ task.buttonText }
							completed={ task.completed || get( taskStatuses, [ task.id, 'completed' ], false ) }
							completedButtonText={ task.completedButtonText }
							completedTitle={ task.completedTitle }
							description={ task.description }
							duration={ task.duration }
							key={ task.id }
							onClick={ this.handleAction( task ) }
							onDismiss={ this.handleToggle( task ) }
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
