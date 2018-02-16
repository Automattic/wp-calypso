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
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteChecklist } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { launchTask, onboardingTasks } from '../onboardingChecklist';
import { recordTracksEvent } from 'state/analytics/actions';
import { createNotice } from 'state/notices/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import ChecklistShowShare from './share';
import SidebarNavigation from 'my-sites/sidebar-navigation';

class ChecklistShow extends PureComponent {
	onAction = id => {
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

	onToggle = id => {
		const { notify, siteId, tasks, update } = this.props;
		const task = find( tasks, { id } );

		if ( task && ! task.completed ) {
			notify( 'is-success', 'You completed a task!' );
			update( siteId, id );
		}
	};

	renderHeader( completed, displayMode ) {
		if ( ! completed ) {
			if ( displayMode ) {
				const title =
					displayMode === 'free' ? 'Your site has been created!' : 'Thank you for your purchase!';

				return (
					<Fragment>
						<img
							src="/calypso/images/signup/confetti.svg"
							aria-hidden="true"
							className="checklist-show__confetti"
						/>
						<FormattedHeader
							headerText={ title }
							subHeaderText={
								"Now that your site has been created, it's time to get it ready for you to share. " +
								"We've prepared a list of things that will help you get there quickly."
							}
						/>
					</Fragment>
				);
			}

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
				<ChecklistShowShare
					className="checklist-show__share"
					siteSlug={ this.props.siteSlug }
					recordTracksEvent={ this.props.track }
				/>
			</Fragment>
		);
	}

	render() {
		const { displayMode, siteId, tasks } = this.props;

		const completed = tasks && ! find( tasks, { completed: false } );

		let title = 'Site Checklist';
		if ( displayMode ) {
			title = 'Thank You';
		}

		return (
			<Main className="checklist-show">
				<SidebarNavigation />
				<DocumentHead title={ title } />
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ this.renderHeader( completed, displayMode ) }
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
	const siteSlug = getSiteSlug( state, siteId );
	const siteChecklist = getSiteChecklist( state, siteId );
	const tasks = onboardingTasks( siteChecklist );
	return { siteId, siteSlug, tasks };
};

const mapDispatchToProps = {
	track: recordTracksEvent,
	notify: createNotice,
	requestTour: requestGuidedTour,
	update: requestSiteChecklistTaskUpdate,
};

export default connect( mapStateToProps, mapDispatchToProps )( ChecklistShow );
