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

import Card from 'components/card';
import Checklist from 'components/checklist';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import { requestSiteChecklistTaskUpdate } from 'state/site-checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteChecklist } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { onboardingTasks, urlForTask } from '../onboardingChecklist';
import { recordTracksEvent } from 'state/analytics/actions';

class ChecklistShow extends PureComponent {
	onAction = id => {
		const { siteSlug, siteChecklist, track } = this.props;
		const url = urlForTask( id, siteSlug );
		if ( url && siteChecklist && siteChecklist.tasks ) {
			const status = siteChecklist.tasks[ id ] ? 'complete' : 'incomplete';
			track( 'calypso_checklist_task_start', {
				checklist_name: 'new_blog',
				step_name: id,
				status,
			} );

			page( url );
		}
	};

	onToggle = taskId => {
		const { siteId, siteChecklist, update } = this.props;

		if ( siteChecklist && siteChecklist.tasks && ! siteChecklist.tasks[ taskId ] ) {
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
				<Card>
					<h1 className="checklist-show__header-heading">Welcome back!</h1>
					<h2 className="checklist-show__header-text">
						Let's get your site ready for its debut with a few quick setup steps
					</h2>
					<Checklist
						isLoading={ ! tasks }
						tasks={ tasks }
						onAction={ this.onAction }
						onToggle={ this.onToggle }
					/>
				</Card>
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
const mapDispatchToProps = { track: recordTracksEvent, update: requestSiteChecklistTaskUpdate };

export default connect( mapStateToProps, mapDispatchToProps )( ChecklistShow );
