/**
 * External dependencies
 *
 * @format
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */

import FormattedHeader from 'components/formatted-header';
import Checklist from 'components/checklist';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteChecklist } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { onboardingTasks, tourForTask, urlForTask } from '../onboardingChecklist';
import { recordTracksEvent } from 'state/analytics/actions';
import { createNotice } from 'state/notices/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

class ChecklistShow extends PureComponent {
	onAction = id => {
		const { requestTour, siteSlug, siteChecklist, track } = this.props;

		const tour = tourForTask( id );
		const url = urlForTask( id, siteSlug );

		if ( siteChecklist && siteChecklist.tasks && ( url || tour ) ) {
			const status = siteChecklist.tasks[ id ] ? 'complete' : 'incomplete';

			track( 'calypso_checklist_task_start', {
				checklist_name: 'new_blog',
				step_name: id,
				status,
			} );

			if ( tour ) {
				requestTour( tour );
			} else {
				page( url );
			}
		}
	};

	onToggle = taskId => {
		const { notify, siteId, siteChecklist, update } = this.props;

		if ( siteChecklist && siteChecklist.tasks && ! siteChecklist.tasks[ taskId ] ) {
			notify( 'is-success', 'You completed a task!' );
			update( siteId, taskId );
		}
	};

	render() {
		const { siteId, siteChecklist } = this.props;
		let tasks = null;

		if ( siteChecklist && siteChecklist.tasks ) {
			tasks = onboardingTasks( siteChecklist.tasks );
		}

		return (
			<Main>
				<DocumentHead title="Site Checklist" />
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<FormattedHeader
					headerText="Welcome back!"
					subHeaderText="Let’s get your site ready for its debut with a few quick setup steps."
				/>
				<Checklist
					isLoading={ ! tasks }
					tasks={ tasks }
					onAction={ this.onAction }
					onToggle={ this.onToggle }
				/>
			</Main>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const siteChecklist = getSiteChecklist( state, siteId );
	const siteSlug = getSiteSlug( state, siteId );
	return { siteId, siteSlug, siteChecklist };
};

const mapDispatchToProps = {
	track: recordTracksEvent,
	notify: createNotice,
	requestTour: requestGuidedTour,
	update: requestSiteChecklistTaskUpdate,
};

export default connect( mapStateToProps, mapDispatchToProps )( ChecklistShow );
