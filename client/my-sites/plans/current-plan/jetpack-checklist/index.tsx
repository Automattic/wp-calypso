import {
	FEATURE_VIDEO_UPLOADS_JETPACK_PRO,
	JETPACK_BACKUP_PRODUCTS,
	isJetpackBackupSlug,
	planHasFeature,
	WPCOM_FEATURES_ANTISPAM,
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_SCAN,
	WPCOM_FEATURES_VAULTPRESS_BACKUPS,
} from '@automattic/calypso-products';
import { Button, Card } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { localize, LocalizeProps } from 'i18n-calypso';
import moment from 'moment';
import { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Checklist, Task } from 'calypso/components/checklist';
import QueryJetpackProductInstallStatus from 'calypso/components/data/query-jetpack-product-install-status';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
// eslint-disable-next-line no-restricted-imports
import withTrackingTool from 'calypso/lib/analytics/with-tracking-tool';
import { getTaskList } from 'calypso/lib/checklist';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import JetpackProductInstall from 'calypso/my-sites/plans/current-plan/jetpack-product-install';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import { requestGuidedTour } from 'calypso/state/guided-tours/actions';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import getJetpackProductInstallStatus from 'calypso/state/selectors/get-jetpack-product-install-status';
import getJetpackWpAdminUrl from 'calypso/state/selectors/get-jetpack-wp-admin-url';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteChecklist from 'calypso/state/selectors/get-site-checklist';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	getSiteSlug,
	getCustomizerUrl,
	isJetpackMinimumVersion,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import JetpackChecklistHeader from './header';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { JetpackProductInstallStatus } from 'calypso/state/selectors/get-jetpack-product-install-status';
import type { AppState, URL } from 'calypso/types';

import './style.scss';

declare global {
	interface Window {
		hj?: ( a: string, b: string ) => void;
	}
}

interface Props {
	hasVideoHosting: boolean;
	hasBackups: boolean;
	hasScan: boolean;
	hasVaultPress: boolean;
	taskStatuses:
		| {
				id: string;
				isCompleted: boolean;
		  }[]
		| undefined;
	widgetCustomizerPaneUrl: URL | null;
	sitePurchases: Purchase[];
	wpAdminUrl: undefined | string;
	akismetFinished: boolean;
	hasAntiSpam: boolean;
	productInstallStatus: JetpackProductInstallStatus | null;
	rewindState: string;
	siteId: number | null;
	siteSlug: string | null;
	vaultpressFinished: boolean;
	recordTracksEvent: typeof recordTracksEvent;
	requestGuidedTour: typeof requestGuidedTour;
}

class JetpackChecklist extends PureComponent< Props & LocalizeProps > {
	componentDidMount() {
		if ( typeof window !== 'undefined' && typeof window.hj === 'function' ) {
			window.hj( 'trigger', 'plans_myplan_jetpack-checklist' );
		}
	}

	hasRecentJetpackBackupPurchase() {
		const { sitePurchases } = this.props;

		const includesJetpackBackup = ( planOrProductSlug: string ) => {
			return (
				isJetpackBackupSlug( planOrProductSlug ) ||
				JETPACK_BACKUP_PRODUCTS.some( ( backupSlug ) => {
					return planHasFeature( planOrProductSlug, backupSlug );
				} )
			);
		};

		const purchasesWithJetpackBackup = sitePurchases.filter( ( sitePurchase ) =>
			includesJetpackBackup( sitePurchase.productSlug )
		);

		const earliestJetpackBackupSubscribeDate = purchasesWithJetpackBackup
			.map( ( purchase ) => moment( purchase.subscribedDate ) )
			.sort( ( a, b ) => a.valueOf() - b.valueOf() )?.[ 0 ];

		if ( ! earliestJetpackBackupSubscribeDate ) {
			return false;
		}

		return earliestJetpackBackupSubscribeDate.isAfter( moment().subtract( 5, 'minutes' ) );
	}

	isComplete( taskId: string ): boolean {
		return getTaskList( this.props ).isCompleted( taskId );
	}

	/**
	 * Returns the localized duration of a task in given minutes.
	 * @param  minutes Number of minutes.
	 * @returns Localized duration.
	 */
	getDuration( minutes: number ) {
		return this.props.translate( '%d minute', '%d minutes', { count: minutes, args: [ minutes ] } );
	}

	handleTaskStart =
		( { taskId, tourId }: { taskId: string; tourId?: string } ) =>
		() => {
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
			hasAntiSpam,
			hasBackups,
			hasScan,
			hasVaultPress,
			productInstallStatus,
			rewindState,
			siteId,
			siteSlug,
			taskStatuses,
			translate,
			vaultpressFinished,
			hasVideoHosting,
		} = this.props;

		const isRewindActive = rewindState === 'active' || rewindState === 'provisioning';
		const isRewindAvailable = rewindState !== 'uninitialized' && rewindState !== 'unavailable';
		const isRewindUnavailable = rewindState === 'unavailable';

		const forceShowJetpackBackupTask = isRewindUnavailable && this.hasRecentJetpackBackupPurchase();

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ ( hasAntiSpam || hasVaultPress ) && siteId && (
					<QueryJetpackProductInstallStatus siteId={ siteId } />
				) }
				{ ( hasBackups || hasVaultPress ) && <QueryRewindState siteId={ siteId } /> }
				<JetpackProductInstall />

				<JetpackChecklistHeader />

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

					{ ( ( hasBackups && hasScan && isRewindAvailable ) || forceShowJetpackBackupTask ) && (
						<Task
							id="jetpack_rewind"
							title={ translate( 'VaultPress Backup and Scan' ) }
							description={ translate(
								"Connect your site's server to Jetpack to perform backups, restores, and security scans."
							) }
							completedButtonText={ translate( 'Change', { context: 'verb' } ) }
							completedTitle={ translate( 'You turned on VaultPress Backup and Scan.' ) }
							duration={ this.getDuration( 3 ) }
							completed={ isRewindActive }
							href={ settingsPath( siteSlug ) }
							onClick={ this.handleTaskStart( {
								taskId: CHECKLIST_KNOWN_TASKS.JETPACK_BACKUPS,
							} ) }
						/>
					) }

					{ hasVaultPress &&
						isRewindUnavailable &&
						productInstallStatus &&
						! forceShowJetpackBackupTask && (
							<Task
								id="jetpack_vaultpress"
								title={ translate( "We're automatically turning on VaultPress." ) }
								completedTitle={ translate( "We've automatically turned on VaultPress." ) }
								completedButtonText={ translate( 'View security dashboard' ) }
								completed={ vaultpressFinished }
								href="https://dashboard.vaultpress.com"
								inProgress={ ! vaultpressFinished }
								onClick={ this.handleTaskStart( {
									taskId: CHECKLIST_KNOWN_TASKS.JETPACK_BACKUPS,
								} ) }
							/>
						) }

					{ siteSlug && hasAntiSpam && productInstallStatus && (
						<Task
							id="jetpack_akismet"
							title={ translate( "We're automatically turning on Akismet Anti-spam." ) }
							completedButtonText={ translate( 'View spam stats' ) }
							completedTitle={ translate( "We've automatically turned on Akismet Anti-spam." ) }
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
						id={ CHECKLIST_KNOWN_TASKS.JETPACK_MONITOR }
						completed={ this.isComplete( CHECKLIST_KNOWN_TASKS.JETPACK_MONITOR ) }
						completedButtonText={ translate( 'Change', { context: 'verb' } ) }
						completedTitle={ translate( 'You turned on Downtime Monitoring.' ) }
						description={ translate(
							'Jetpack will continuously watch your site, and alert you with instant notifications if downtime is detected.'
						) }
						duration={ this.getDuration( 3 ) }
						href={ `/settings/security/${ siteSlug }` }
						onClick={ this.handleTaskStart( {
							taskId: CHECKLIST_KNOWN_TASKS.JETPACK_MONITOR,
							tourId: 'jetpackMonitoring',
						} ) }
						title={ translate( 'Downtime Monitoring' ) }
					/>

					<Task
						id={ CHECKLIST_KNOWN_TASKS.JETPACK_PLUGIN_UPDATES }
						completed={ this.isComplete( CHECKLIST_KNOWN_TASKS.JETPACK_PLUGIN_UPDATES ) }
						completedButtonText={ translate( 'Change', { context: 'verb' } ) }
						completedTitle={ translate( 'You turned on automatic plugin updates.' ) }
						description={ translate(
							'Choose which WordPress plugins you want to keep automatically updated.'
						) }
						duration={ this.getDuration( 3 ) }
						href={ `/plugins/manage/${ siteSlug }` }
						onClick={ this.handleTaskStart( {
							taskId: CHECKLIST_KNOWN_TASKS.JETPACK_PLUGIN_UPDATES,
							tourId: 'jetpackPluginUpdates',
						} ) }
						title={ translate( 'Automatic Plugin Updates' ) }
					/>

					<Task
						id={ CHECKLIST_KNOWN_TASKS.JETPACK_SIGN_IN }
						completed={ this.isComplete( CHECKLIST_KNOWN_TASKS.JETPACK_SIGN_IN ) }
						completedButtonText={ translate( 'Change', { context: 'verb' } ) }
						completedTitle={ translate( 'You completed your sign in preferences.' ) }
						description={ translate(
							'Manage your log in preferences and two-factor authentication settings.'
						) }
						duration={ this.getDuration( 3 ) }
						href={ `/settings/security/${ siteSlug }` }
						onClick={ this.handleTaskStart( {
							taskId: CHECKLIST_KNOWN_TASKS.JETPACK_SIGN_IN,
							tourId: 'jetpackSignIn',
						} ) }
						title={ translate( 'WordPress.com sign in' ) }
					/>

					<Task
						id={ CHECKLIST_KNOWN_TASKS.JETPACK_SITE_ACCELERATOR }
						completed={ this.isComplete( CHECKLIST_KNOWN_TASKS.JETPACK_SITE_ACCELERATOR ) }
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
							taskId: CHECKLIST_KNOWN_TASKS.JETPACK_SITE_ACCELERATOR,
							tourId: 'jetpackSiteAccelerator',
						} ) }
						title={ translate( 'Site Accelerator' ) }
					/>

					{ hasVideoHosting && (
						<Task
							id={ CHECKLIST_KNOWN_TASKS.JETPACK_VIDEO_HOSTING }
							title={ translate( 'Video Hosting' ) }
							description={ translate(
								'Enable fast, high-definition, ad-free video hosting through our global CDN network.'
							) }
							completed={ this.isComplete( CHECKLIST_KNOWN_TASKS.JETPACK_VIDEO_HOSTING ) }
							completedButtonText={ translate( 'Upload videos' ) }
							completedTitle={ translate(
								'High-speed, high-definition, and ad-free video hosting is enabled.'
							) }
							duration={ this.getDuration( 3 ) }
							href={
								this.isComplete( CHECKLIST_KNOWN_TASKS.JETPACK_VIDEO_HOSTING )
									? `/media/videos/${ siteSlug }`
									: `/settings/performance/${ siteSlug }`
							}
							onClick={ this.handleTaskStart( {
								taskId: CHECKLIST_KNOWN_TASKS.JETPACK_VIDEO_HOSTING,
								tourId: 'jetpackVideoHosting',
							} ) }
						/>
					) }
				</Checklist>
			</Fragment>
		);
	}
}

function mapStateToProps( state: AppState ) {
	const OFFER_RESET_VIDEO_MINIMUM_JETPACK_VERSION = '8.9.2';

	const siteId = getSelectedSiteId( state );
	const productInstallStatus = getJetpackProductInstallStatus( state, siteId ?? 0 );
	const rewindState = getRewindState( state, siteId ).state;

	// Link to "My Plan" page in Jetpack
	const wpAdminUrl = getJetpackWpAdminUrl( state );

	return {
		akismetFinished: !! (
			productInstallStatus && productInstallStatus.akismet_status === 'installed'
		),
		vaultpressFinished: !! (
			productInstallStatus &&
			[ 'installed', 'skipped' ].includes( productInstallStatus.vaultpress_status )
		),
		widgetCustomizerPaneUrl: siteId ? getCustomizerUrl( state, siteId, 'widgets' ) : null,
		hasAntiSpam: siteHasFeature( state, siteId, WPCOM_FEATURES_ANTISPAM ),
		hasBackups: siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS ),
		hasScan: siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN ),
		hasVaultPress: siteHasFeature( state, siteId, WPCOM_FEATURES_VAULTPRESS_BACKUPS ),
		rewindState,
		productInstallStatus,
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		taskStatuses: getSiteChecklist( state, siteId ?? 0 )?.tasks,
		wpAdminUrl,
		hasVideoHosting: !! (
			siteHasFeature( state, siteId, FEATURE_VIDEO_UPLOADS_JETPACK_PRO ) &&
			isJetpackMinimumVersion( state, siteId ?? 0, OFFER_RESET_VIDEO_MINIMUM_JETPACK_VERSION )
		),
		sitePurchases: getSitePurchases( state, siteId ),
	};
}

const mapDispatchToProps = {
	recordTracksEvent,
	requestGuidedTour,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( withTrackingTool( 'HotJar' )( JetpackChecklist ) ) );
