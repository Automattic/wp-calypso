/**
 * External dependencies
 */
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { connect } from 'react-redux';
import { flowRight, get, includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Checklist, Task } from 'components/checklist';
import getJetpackProductInstallStatus from 'state/selectors/get-jetpack-product-install-status';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import getRewindState from 'state/selectors/get-rewind-state';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import JetpackChecklistFooter from './footer';
import JetpackChecklistHeader from './header';
import QueryJetpackProductInstallStatus from 'components/data/query-jetpack-product-install-status';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { format as formatUrl, parse as parseUrl } from 'url';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, getCustomizerUrl } from 'state/sites/selectors';
import { isDesktop } from 'lib/viewport';
import {
	getJetpackChecklistTaskDuration,
	JETPACK_SECURITY_CHECKLIST_TASKS,
	JETPACK_PERFORMANCE_CHECKLIST_TASKS,
	JETPACK_CHECKLIST_TASK_BACKUPS_REWIND,
	ChecklistTasksetUi,
} from './constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { isEnabled } from 'config';
import { URL } from 'types';
import { getSitePlanSlug } from 'state/sites/plans/selectors';
import { isBusinessPlan, isPremiumPlan } from 'lib/plans';
import withTrackingTool from 'lib/analytics/with-tracking-tool';

/**
 * Style dependencies
 */
import './style.scss';
import { getTaskList } from 'my-sites/checklist/wpcom-checklist/wpcom-task-list';

interface ChecklistTaskState {
	[taskId: string]: {
		completed: null | boolean;
	};
}

interface Props {
	isPremium: boolean;
	isProfessional: boolean;
	isPaidPlan: boolean;
	taskStatuses: ChecklistTaskState | undefined;
	widgetCustomizerPaneUrl: URL | null;
}

class JetpackChecklist extends PureComponent< Props > {
	componentDidMount() {
		if ( typeof window !== 'undefined' && typeof window.hj === 'function' ) {
			window.hj( 'trigger', 'plans_myplan_jetpack-checklist' );
		}
	}

	isComplete( taskId: string ): boolean {
		return getTaskList( this.props ).isCompleted( taskId );
	}

	handleTaskStart = ( { taskId, tourId }: { taskId: string; tourId?: string } ) => () => {
		if ( taskId ) {
			this.props.recordTracksEvent( 'calypso_checklist_task_start', {
				checklist_name: 'jetpack',
				location: 'JetpackChecklist',
				step_name: taskId,
			} );
		}

		if ( tourId && ! this.isComplete( taskId ) && isDesktop() ) {
			this.props.requestGuidedTour( tourId );
		}
	};

	handleWpAdminLink = () => {
		this.props.recordTracksEvent( 'calypso_checklist_wpadmin_click', {
			checklist_name: 'jetpack',
			location: 'JetpackChecklist',
		} );
	};

	renderTaskSet( checklistTasks: ChecklistTasksetUi ): ReactNode {
		if ( ! this.props.taskStatuses ) {
			return null;
		}
		const taskIds =
			checklistTasks === JETPACK_PERFORMANCE_CHECKLIST_TASKS
				? // Force render all the tasks from this development-only list
				  // @todo Remove this branch when API returns performance task statuses
				  Object.keys( JETPACK_PERFORMANCE_CHECKLIST_TASKS )
				: getTaskList( this.props )
						.getIds()
						.filter( taskId => taskId in checklistTasks );

		return taskIds.map( taskId => {
			const task = checklistTasks[ taskId ];

			const isComplete = this.isComplete( taskId );

			return (
				<Task
					completed={ isComplete }
					completedButtonText={ task.completedButtonText }
					completedTitle={ task.completedTitle }
					description={ task.description }
					duration={ task.duration }
					href={ task.getUrl( this.props.siteSlug, isComplete ) }
					id={ taskId }
					key={ taskId }
					onClick={ this.handleTaskStart( {
						taskId,
						tourId: get( task, [ 'tourId' ] ),
					} ) }
					title={ task.title }
				/>
			);
		} );
	}

	trackExpandTask = ( { id }: { id: string } ) =>
		void this.props.recordTracksEvent( 'calypso_checklist_task_expand', {
			step_name: id,
			product: 'Jetpack',
		} );

	render() {
		const {
			akismetFinished,
			isPaidPlan,
			isPremium,
			isProfessional,
			productInstallStatus,
			rewindState,
			siteId,
			siteSlug,
			taskStatuses,
			translate,
			vaultpressFinished,
			wpAdminUrl,
		} = this.props;

		const isRewindActive = rewindState === 'active' || rewindState === 'provisioning';
		const isRewindAvailable = rewindState !== 'uninitialized' && rewindState !== 'unavailable';
		const isRewindUnavailable = rewindState === 'unavailable';

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ isPaidPlan && <QueryJetpackProductInstallStatus siteId={ siteId } /> }
				{ isPaidPlan && <QueryRewindState siteId={ siteId } /> }

				<JetpackChecklistHeader isPaidPlan={ isPaidPlan } />

				<Checklist
					className="jetpack-checklist"
					isPlaceholder={ ! taskStatuses }
					onExpandTask={ this.trackExpandTask }
					progressText={ translate( 'Your Jetpack setup progress' ) }
				>
					<Task
						id="jetpack_task_protect"
						title={ translate(
							"We've automatically protected you from brute force login attacks."
						) }
						completedButtonText={ translate( 'Configure' ) }
						completed
						href={ `/settings/security/${ siteSlug }` }
						onClick={ this.handleTaskStart( { taskId: 'jetpack_protect' } ) }
					/>
					{ isPaidPlan && isRewindAvailable && (
						<Task
							{ ...JETPACK_CHECKLIST_TASK_BACKUPS_REWIND }
							completed={ isRewindActive }
							href={ JETPACK_CHECKLIST_TASK_BACKUPS_REWIND.getUrl( siteSlug ) }
							onClick={ this.handleTaskStart( {
								taskId: 'jetpack_backups',
								tourId: isRewindActive ? undefined : 'jetpackBackupsRewind',
							} ) }
						/>
					) }
					{ isPaidPlan && isRewindUnavailable && productInstallStatus && (
						<Task
							id="jetpack_vaultpress"
							title={ translate( "We're automatically turning on Backup and Scan." ) }
							completedTitle={ translate( "We've automatically turned on Backup and Scan." ) }
							completedButtonText={ translate( 'View security dashboard' ) }
							completed={ vaultpressFinished }
							href="https://dashboard.vaultpress.com"
							inProgress={ ! vaultpressFinished }
							onClick={ this.handleTaskStart( { taskId: 'jetpack_backups' } ) }
						/>
					) }
					{ isPaidPlan && productInstallStatus && (
						<Task
							id="jetpack_akismet"
							title={ translate( "We're automatically turning on spam filtering." ) }
							completedButtonText={ translate( 'View spam stats' ) }
							completedTitle={ translate( "We've automatically turned on spam filtering." ) }
							completed={ akismetFinished }
							href={ `//${ siteSlug.replace(
								'::',
								'/'
							) }/wp-admin/admin.php?page=akismet-key-config` }
							inProgress={ ! akismetFinished }
							onClick={ this.handleTaskStart( { taskId: 'jetpack_spam_filtering' } ) }
							target="_blank"
						/>
					) }

					{ this.renderTaskSet( JETPACK_SECURITY_CHECKLIST_TASKS ) }
					{ isEnabled( 'jetpack/checklist/performance' ) &&
						this.renderTaskSet( JETPACK_PERFORMANCE_CHECKLIST_TASKS ) }
					{ isEnabled( 'jetpack/checklist/performance' ) && ( isPremium || isProfessional ) && (
						<Task
							title={ translate( 'Video Hosting' ) }
							description={ translate(
								'Enable fast, high-definition, ad-free video hosting through our global CDN network.'
							) }
							completed={ this.isComplete( 'jetpack_video_hosting' ) }
							completedButtonText={ translate( 'Upload videos' ) }
							completedTitle={ translate(
								'High-speed, high-definition, and ad-free video hosting is enabled.'
							) }
							duration={ getJetpackChecklistTaskDuration( 3 ) }
							href={
								this.isComplete( 'jetpack_video_hosting' )
									? `/media/videos/${ siteSlug }`
									: `/settings/performance/${ siteSlug }`
							}
							id="video-hosting"
							onClick={ this.handleTaskStart( {
								taskId: 'jetpack_video_hosting',
								tourId: 'jetpackVideoHosting',
							} ) }
						/>
					) }
					{ isEnabled( 'jetpack/checklist/performance' ) && isProfessional && (
						<Task
							title={ translate( 'Enhanced Search' ) }
							description={ translate(
								'Activate an enhanced, customizable search to replace the default WordPress search feature.'
							) }
							completedButtonText={ translate( 'Add search widget' ) }
							completedTitle={ translate(
								'The default WordPress search has been replaced by Enhanced Search.'
							) }
							duration={ getJetpackChecklistTaskDuration( 1 ) }
							completed={ this.isComplete( 'jetpack_search' ) }
							href={
								this.isComplete( 'jetpack_search' )
									? this.props.widgetCustomizerPaneUrl
									: `/settings/performance/${ siteSlug }`
							}
							id="enhanced-search"
							onClick={ this.handleTaskStart( {
								taskId: 'jetpack_search',
								tourId: 'jetpackSearch',
							} ) }
						/>
					) }
				</Checklist>

				{ wpAdminUrl && (
					<JetpackChecklistFooter
						wpAdminUrl={ wpAdminUrl }
						handleWpAdminLink={ this.handleWpAdminLink }
					/>
				) }
			</Fragment>
		);
	}
}

const connectComponent = connect(
	state => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		const productInstallStatus = getJetpackProductInstallStatus( state, siteId );
		const rewindState = get( getRewindState( state, siteId ), 'state', 'uninitialized' );

		// Link to "My Plan" page in Jetpack
		let wpAdminUrl = get( site, 'options.admin_url' );
		wpAdminUrl = wpAdminUrl
			? formatUrl( {
					...parseUrl( wpAdminUrl + 'admin.php' ),
					query: { page: 'jetpack' },
					hash: '/my-plan',
			  } )
			: undefined;

		const planSlug = getSitePlanSlug( state, siteId );
		const isPremium = !! planSlug && isPremiumPlan( planSlug );
		const isProfessional = ! isPremium && !! planSlug && isBusinessPlan( planSlug );
		const isPaidPlan = isPremium || isProfessional || isSiteOnPaidPlan( state, siteId );

		return {
			akismetFinished: productInstallStatus && productInstallStatus.akismet_status === 'installed',
			vaultpressFinished:
				productInstallStatus &&
				includes( [ 'installed', 'skipped' ], productInstallStatus.vaultpress_status ),
			widgetCustomizerPaneUrl: siteId ? getCustomizerUrl( state, siteId, 'widgets' ) : null,
			isPremium,
			isProfessional,
			isPaidPlan,
			rewindState,
			// `phase2: true` is passed to `getTaskList()` in the component and makes it possible to use
			// the array-based checklist data format
			phase2: true,
			productInstallStatus,
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
			taskStatuses: get( getSiteChecklist( state, siteId ), 'tasks' ),
			wpAdminUrl,
		};
	},
	{
		recordTracksEvent,
		requestGuidedTour,
	}
);

export default flowRight(
	connectComponent,
	localize,
	withTrackingTool( 'HotJar' )
)( JetpackChecklist );
