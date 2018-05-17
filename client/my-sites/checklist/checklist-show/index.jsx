/**
 * External dependencies
 *
 * @format
 */
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import EmptyContent from 'components/empty-content';
import FormattedHeader from 'components/formatted-header';
import Checklist from 'blocks/checklist';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import { jetpackTasks } from '../jetpack-checklist';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isSiteAutomatedTransfer, getSiteChecklist } from 'state/selectors';
import { isJetpackSite, getSiteSlug } from 'state/sites/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { launchTask, onboardingTasks } from '../onboardingChecklist';
import { recordTracksEvent } from 'state/analytics/actions';
import { createNotice } from 'state/notices/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import ChecklistShowShare from './share';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';

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

	getHeaderTitle( displayMode ) {
		if ( displayMode === 'free' ) {
			return 'Your site has been created!';
		}

		return 'Thank you for your purchase!';
	}

	getSubHeaderText( displayMode ) {
		if ( displayMode === 'gsuite' ) {
			return this.props.translate(
				'We emailed %(email)s with instructions to complete your G Suite setup. ' +
					'In the mean time, let’s get your new site ready for you to share. ' +
					'We’ve prepared a list of things that will help you get there quickly.',
				{
					args: {
						email: this.props.user.email,
					},
				}
			);
		}

		return (
			"Now that your site has been created, it's time to get it ready for you to share. " +
			"We've prepared a list of things that will help you get there quickly."
		);
	}

	renderHeader( completed, displayMode ) {
		if ( completed ) {
			return (
				<Fragment>
					<img
						src="/calypso/images/signup/confetti.svg"
						aria-hidden="true"
						className="checklist-show__confetti"
						alt=""
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

		if ( displayMode ) {
			return (
				<Fragment>
					<img
						src="/calypso/images/signup/confetti.svg"
						aria-hidden="true"
						className="checklist-show__confetti"
						alt=""
					/>
					<FormattedHeader
						headerText={ this.getHeaderTitle( displayMode ) }
						subHeaderText={ this.getSubHeaderText( displayMode ) }
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

	renderChecklist() {
		const { displayMode, siteId, tasks } = this.props;
		const completed = tasks && ! find( tasks, { completed: false } );

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ this.renderHeader( completed, displayMode ) }
				<Checklist
					isLoading={ ! tasks }
					tasks={ tasks }
					onAction={ this.onAction }
					onToggle={ this.onToggle }
				/>
			</Fragment>
		);
	}

	render() {
		const { checklistAvailable, displayMode, translate } = this.props;

		let title = 'Site Checklist';
		let path = '/checklist/:site';
		if ( displayMode ) {
			title = 'Thank You';
			path += `?d=${ displayMode }`;
		}

		return (
			<Main className="checklist-show">
				<PageViewTracker path={ path } title={ title } />
				<SidebarNavigation />
				<DocumentHead title={ title } />
				{ checklistAvailable ? (
					this.renderChecklist()
				) : (
					<EmptyContent title={ translate( 'Checklist not available for this site' ) } />
				) }
			</Main>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const siteChecklist = getSiteChecklist( state, siteId );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const tasks = isJetpack ? jetpackTasks( siteChecklist ) : onboardingTasks( siteChecklist );
	return {
		checklistAvailable: ! isAtomic && ( config.isEnabled( 'jetpack/checklist' ) || ! isJetpack ),
		siteId,
		siteSlug,
		tasks,
		user: getCurrentUser( state ),
	};
};

const mapDispatchToProps = {
	track: recordTracksEvent,
	notify: createNotice,
	requestTour: requestGuidedTour,
	update: requestSiteChecklistTaskUpdate,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( ChecklistShow ) );
