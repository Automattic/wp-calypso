/**
 * External dependencies
 *
 * @format
 */

import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash';

/**
 * Internal dependencies
 */

import FormattedHeader from 'components/formatted-header';
import Checklist from 'components/checklist';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import ShareButton from 'components/share-button';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteChecklist } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { launchTask, launchCompletedTask, onboardingTasks } from '../onboardingChecklist';
import { recordTracksEvent } from 'state/analytics/actions';
import { createNotice } from 'state/notices/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

class ChecklistShow extends PureComponent {
	onAction = id => {
		const { requestTour, siteSlug, siteChecklist, track } = this.props;

		if ( siteChecklist && siteChecklist.tasks ) {
			if ( siteChecklist.tasks[ id ] ) {
				launchCompletedTask( {
					id,
					siteSlug,
				} );
			} else {
				launchTask( {
					id,
					location: 'checklist_show',
					requestTour,
					siteSlug,
					track,
				} );
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

	renderHeader( completed ) {
		const shareTo = [ 'facebook', 'twitter', 'linkedin', 'google-plus', 'pinterest' ];

		if ( ! completed ) {
			return (
				<FormattedHeader
					headerText="Welcome back!"
					subHeaderText="Let’s get your site ready for its debut with a few quick setup steps."
				/>
			);
		}

		return (
			<Fragment>
				<img
					src="/calypso/images/signup/confetti.svg"
					aria-hidden="true"
					className="checklist-show__confetti"
				/>
				<FormattedHeader
					headerText="Congratulations!"
					subHeaderText="You have completed all your tasks. Now let's tell people about it. Share your site."
				/>
				<div className="checklist-show__share">
					{ shareTo.map( option => (
						<ShareButton
							key={ option }
							url={ `https://${ this.props.siteSlug }` }
							title="Delighted to announce my new website is live today - please take a look."
							siteSlug={ this.props.siteSlug }
							service={ option }
						/>
					) ) }
				</div>
			</Fragment>
		);
	}

	render() {
		const { siteId, siteChecklist } = this.props;
		let tasks = null;

		if ( siteChecklist && siteChecklist.tasks ) {
			tasks = onboardingTasks( siteChecklist.tasks );
		}

		const completed = tasks && ! find( tasks, { completed: false } );

		return (
			<Main className="checklist-show">
				<DocumentHead title="Site Checklist" />
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ this.renderHeader( completed ) }
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
