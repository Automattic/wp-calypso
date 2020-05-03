/**
 * External dependencies
 */
import { isDesktop } from '@automattic/viewport';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, includes } from 'lodash';
import { localize, LocalizeProps } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Checklist, Task } from 'components/checklist';
import getJetpackProductInstallStatus from 'state/selectors/get-jetpack-product-install-status';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import getRewindState from 'state/selectors/get-rewind-state';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import JetpackChecklistHeader from './header';
import QueryJetpackProductInstallStatus from 'components/data/query-jetpack-product-install-status';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { format as formatUrl, parse as parseUrl } from 'url';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug, getCustomizerUrl } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { URL } from 'types';
import { getSitePlanSlug } from 'state/sites/plans/selectors';
import { isBusinessPlan, isPremiumPlan } from 'lib/plans';
import withTrackingTool from 'lib/analytics/with-tracking-tool';
import { Button, Card } from '@automattic/components';
import JetpackProductInstall from 'my-sites/plans/current-plan/jetpack-product-install';
import { getTaskList } from 'lib/checklist';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	isPremium: boolean;
	isProfessional: boolean;
	isPaidPlan: boolean;
	taskStatuses:
		| {
				id: string;
				isCompleted: boolean;
		  }[]
		| undefined;
	widgetCustomizerPaneUrl: URL | null;
}

class JetpackChecklist extends PureComponent< Props & LocalizeProps > {
	componentDidMount() {
		if ( typeof window !== 'undefined' && typeof window.hj === 'function' ) {
			window.hj( 'trigger', 'plans_myplan_jetpack-checklist' );
		}
	}

	isComplete( taskId: string ): boolean {
		return getTaskList( this.props ).isCompleted( taskId );
	}

	/**
	 * Returns the localized duration of a task in given minutes.
	 *
	 * @param  minutes Number of minutes.
	 * @returns Localized duration.
	 */
	getDuration( minutes: number ) {
		return this.props.translate( '%d minute', '%d minutes', { count: minutes, args: [ minutes ] } );
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

	trackExpandTask = ( { id }: { id: string } ) =>
		void this.props.recordTracksEvent( 'calypso_checklist_task_expand', {
			step_name: id,
			product: 'Jetpack',
		} );

	renderJetpackFooter = () => {
		const translate = this.props.translate;

		return (
			<Card compact className="jetpack-checklist__footer">
				<p>{ translate( 'Return to your self-hosted WordPress dashboard.' ) }</p>
				<Button
					compact
					data-tip-target="jetpack-checklist-wpadmin-link"
					href={ this.props.wpAdminUrl }
					onClick={ this.handleWpAdminLink }
				>
					{ translate( 'Return to WP Admin' ) }
				</Button>
			</Card>
		);
	};

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
		} = this.props;

		const isRewindActive = rewindState === 'active' || rewindState === 'provisioning';
		const isRewindAvailable = rewindState !== 'uninitialized' && rewindState !== 'unavailable';
		const isRewindUnavailable = rewindState === 'unavailable';

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ isPaidPlan && <QueryJetpackProductInstallStatus siteId={ siteId } /> }
				{ isPaidPlan && <QueryRewindState siteId={ siteId } /> }
				<JetpackProductInstall />

				<JetpackChecklistHeader isPaidPlan={ isPaidPlan } />

				<Checklist
					className="jetpack-checklist"
					isPlaceholder={ ! taskStatuses }
					onExpandTask={ this.trackExpandTask }
					checklistFooter={ this.renderJetpackFooter() }
				>
					<Task
						id="jetpack_task_protect"
						title={ translate(
							"We're automatically protecting you from brute force login attacks."
						) }
						completedTitle={ translate(
							"We've automatically protected you from brute force login attacks."
						) }
						completedButtonText={ translate( 'Configure' ) }
						completed
						href={ `/settings/security/${ siteSlug }` }
						onClick={ this.handleTaskStart( { taskId: 'jetpack_protect' } ) }
					/>

					{ isPaidPlan && isRewindAvailable && (
						<Task
							id="jetpack_rewind"
							title={ translate( 'Backup and Scan' ) }
							description={ translate(
								"Connect your site's server to Jetpack to perform backups, restores, and security scans."
							) }
							completedButtonText={ translate( 'Change', { context: 'verb' } ) }
							completedTitle={ translate( 'You turned on Backup and Scan.' ) }
							duration={ this.getDuration( 3 ) }
							completed={ isRewindActive }
							href={ `/settings/security/${ siteSlug }` }
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
							title={ translate( "We're automatically turning on Anti-spam." ) }
							completedButtonText={ translate( 'View spam stats' ) }
							completedTitle={ translate( "We've automatically turned on Anti-spam." ) }
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

					<Task
						id="jetpack_monitor"
						completed={ this.isComplete( 'jetpack_monitor' ) }
						completedButtonText={ translate( 'Change', { context: 'verb' } ) }
						completedTitle={ translate( 'You turned on Downtime Monitoring.' ) }
						description={ translate(
							"Monitor your site's uptime and alert you the moment downtime is detected with instant notifications."
						) }
						duration={ this.getDuration( 3 ) }
						href={ `/settings/security/${ siteSlug }` }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_monitor',
							tourId: 'jetpackMonitoring',
						} ) }
						title={ translate( 'Downtime Monitoring' ) }
					/>

					<Task
						id="jetpack_plugin_updates"
						completed={ this.isComplete( 'jetpack_plugin_updates' ) }
						completedButtonText={ translate( 'Change', { context: 'verb' } ) }
						completedTitle={ translate( 'You turned on automatic plugin updates.' ) }
						description={ translate(
							'Choose which WordPress plugins you want to keep automatically updated.'
						) }
						duration={ this.getDuration( 3 ) }
						href={ `/plugins/manage/${ siteSlug }` }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_plugin_updates',
							tourId: 'jetpackPluginUpdates',
						} ) }
						title={ translate( 'Automatic Plugin Updates' ) }
					/>

					<Task
						id="jetpack_sign_in"
						completed={ this.isComplete( 'jetpack_sign_in' ) }
						completedButtonText={ translate( 'Change', { context: 'verb' } ) }
						completedTitle={ translate( 'You completed your sign in preferences.' ) }
						description={ translate(
							'Manage your log in preferences and two-factor authentication settings.'
						) }
						duration={ this.getDuration( 3 ) }
						href={ `/settings/security/${ siteSlug }` }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_sign_in',
							tourId: 'jetpackSignIn',
						} ) }
						title={ translate( 'WordPress.com sign in' ) }
					/>

					<Task
						id="jetpack_site_accelerator"
						completed={ this.isComplete( 'jetpack_site_accelerator' ) }
						completedButtonText={ translate( 'Configure' ) }
						completedTitle={ translate(
							'Site accelerator is serving your images and static files through our global CDN.'
						) }
						description={ translate(
							'Serve your images and static files through our global CDN and watch your page load time drop.'
						) }
						duration={ this.getDuration( 1 ) }
						href={ `/settings/performance/${ siteSlug }` }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_site_accelerator',
							tourId: 'jetpackSiteAccelerator',
						} ) }
						title={ translate( 'Site Accelerator' ) }
					/>

					<Task
						id="jetpack_lazy_images"
						completed={ this.isComplete( 'jetpack_lazy_images' ) }
						completedButtonText={ translate( 'Upload images' ) }
						completedTitle={ translate( 'Lazy load images is improving your site speed.' ) }
						description={ translate(
							"Improve your site's speed by only loading images when visible on the screen."
						) }
						duration={ this.getDuration( 1 ) }
						href={
							this.isComplete( 'jetpack_lazy_images' )
								? `/media/${ siteSlug }`
								: `/settings/performance/${ siteSlug }`
						}
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_lazy_images',
							tourId: 'jetpackLazyImages',
						} ) }
						title={ translate( 'Lazy Load Images' ) }
					/>

					{ ( isPremium || isProfessional ) && (
						<Task
							id="jetpack_video_hosting"
							title={ translate( 'Video Hosting' ) }
							description={ translate(
								'Enable fast, high-definition, ad-free video hosting through our global CDN network.'
							) }
							completed={ this.isComplete( 'jetpack_video_hosting' ) }
							completedButtonText={ translate( 'Upload videos' ) }
							completedTitle={ translate(
								'High-speed, high-definition, and ad-free video hosting is enabled.'
							) }
							duration={ this.getDuration( 3 ) }
							href={
								this.isComplete( 'jetpack_video_hosting' )
									? `/media/videos/${ siteSlug }`
									: `/settings/performance/${ siteSlug }`
							}
							onClick={ this.handleTaskStart( {
								taskId: 'jetpack_video_hosting',
								tourId: 'jetpackVideoHosting',
							} ) }
						/>
					) }

					{ isProfessional && (
						<Task
							id="jetpack_search"
							title={ translate( 'Enhanced Search' ) }
							description={ translate(
								'Activate an enhanced, customizable search to replace the default WordPress search feature.'
							) }
							completedButtonText={ translate( 'Add search widget' ) }
							completedTitle={ translate(
								'The default WordPress search has been replaced by Enhanced Search.'
							) }
							duration={ this.getDuration( 1 ) }
							completed={ this.isComplete( 'jetpack_search' ) }
							href={
								this.isComplete( 'jetpack_search' )
									? this.props.widgetCustomizerPaneUrl
									: `/settings/performance/${ siteSlug }`
							}
							onClick={ this.handleTaskStart( {
								taskId: 'jetpack_search',
								tourId: 'jetpackSearch',
							} ) }
						/>
					) }
				</Checklist>
			</Fragment>
		);
	}
}

const connectComponent = connect(
	( state ) => {
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

export default connectComponent( localize( withTrackingTool( 'HotJar' )( JetpackChecklist ) ) );
