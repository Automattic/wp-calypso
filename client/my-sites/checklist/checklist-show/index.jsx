/** @format */

/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, merge } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import Checklist from 'blocks/checklist';
import { jetpackTasks } from '../jetpack-checklist';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { isJetpackSite, getSiteSlug } from 'state/sites/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { launchTask, wpcomTasks } from '../onboardingChecklist';
import { recordTracksEvent } from 'state/analytics/actions';
import { createNotice } from 'state/notices/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

class ChecklistShow extends PureComponent {
	handleAction = id => {
		const { requestTour, siteSlug, tasks, track } = this.props;
		const task = tasks[ id ];

		launchTask( {
			task,
			location: 'checklist_show',
			requestTour,
			siteSlug,
			track,
		} );
	};

	handleToggle = id => {
		const { notify, siteId, tasks, update } = this.props;
		const task = tasks[ id ];

		if ( task && ! task.completed ) {
			notify( 'is-success', 'You completed a task!' );
			update( siteId, id );
		}
	};

	render() {
		const { siteId, tasks } = this.props;

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<Checklist
					isLoading={ ! tasks }
					tasks={ tasks }
					onAction={ this.handleAction }
					onToggle={ this.handleToggle }
				/>
			</Fragment>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const siteChecklist = getSiteChecklist( state, siteId );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const tasks = isJetpack ? jetpackTasks : wpcomTasks;
	const tasksFromServer = get( siteChecklist, [ 'tasks' ] );

	return {
		checklistAvailable: ! isAtomic && ( config.isEnabled( 'jetpack/checklist' ) || ! isJetpack ),
		siteId,
		siteSlug,
		tasks: tasksFromServer ? merge( {}, tasks, tasksFromServer ) : null,
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
