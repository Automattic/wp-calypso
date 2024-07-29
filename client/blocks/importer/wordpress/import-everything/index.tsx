import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import {
	MigrationStatus,
	type MigrationStatusError,
	type SiteDetails,
} from '@automattic/data-stores';
import { Hooray, SubTitle, Title } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';
import ImportUsers from 'calypso/blocks/importer/wordpress/import-everything/import-users';
import PreMigrationScreen from 'calypso/blocks/importer/wordpress/import-everything/pre-migration';
import AsyncLoad from 'calypso/components/async-load';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import { SectionMigrate } from 'calypso/my-sites/migrate/section-migrate';
import { isMigrationTrialSite } from 'calypso/sites-dashboard/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { receiveSite, requestSite, updateSiteMigrationMeta } from 'calypso/state/sites/actions';
import { getSite, getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import DomainInfo from '../../components/domain-info';
import DoneButton from '../../components/done-button';
import NotAuthorized from '../../components/not-authorized';
import { isTargetSitePlanCompatible } from '../../util';
import { WPImportOption, type MigrationState } from '../types';
import { clearMigrateSource, retrieveMigrateSource } from '../utils';
import MigrationError from './migration-error';
import MigrationProgress from './migration-progress';
import type { UrlData } from 'calypso/blocks/import/types';
import type { StepNavigator } from 'calypso/blocks/importer/types';

interface Props {
	initImportRun?: boolean;
	sourceSiteId: number | null;
	targetSite: SiteDetails;
	targetSiteId: number | null;
	targetSiteSlug: string;
	stepNavigator?: StepNavigator;
	showConfirmDialog: boolean;
	sourceUrlAnalyzedData?: UrlData | null;
}

type ExtraParams = {
	[ key: string ]: any;
};

export class ImportEverything extends SectionMigrate {
	componentDidUpdate( prevProps: any, prevState: MigrationState ) {
		super.componentDidUpdate( prevProps, prevState );
		this.recordMigrationStatusChange( prevState );
	}

	goToCart = () => {
		const { stepNavigator, isMigrateFromWp } = this.props;
		const extraParamsArg: ExtraParams = {};
		if ( isMigrateFromWp ) {
			extraParamsArg[ 'skipCta' ] = true;
		}
		stepNavigator?.goToCheckoutPage?.( WPImportOption.EVERYTHING, extraParamsArg );
	};

	resetMigration = () => {
		const { stepNavigator, isMigrateFromWp } = this.props;

		this.requestMigrationReset( this.props.targetSiteId ).finally( () => {
			if ( isMigrateFromWp ) {
				stepNavigator?.goToSitePickerPage?.();
			} else {
				stepNavigator?.goToImportCapturePage?.();
			}

			/**
			 * Note this migrationStatus is local, thus the setState vs setMigrationState.
			 * Call to updateFromAPI will update both local and non-local state.
			 */
			this.setState(
				{
					migrationStatus: MigrationStatus.INACTIVE,
					errorMessage: '',
				},
				this.updateFromAPI
			);
		} );
	};

	finishMigration = () => {
		const { targetSiteId } = this.props;

		/**
		 * Request another update after the migration is finished to
		 * update the site title and other info that may have changed.
		 */
		this.props.requestSite( targetSiteId );

		this.requestMigrationReset( targetSiteId );
		// Clear the isMigrateFromWP flag
		if ( retrieveMigrateSource() ) {
			clearMigrateSource();
		}
	};

	recordMigrationStatusChange = ( prevState: MigrationState ) => {
		const trackEventProps = {
			source_site_id: this.props.sourceSiteId,
			source_site_url: this.props.sourceUrlAnalyzedData?.url,
			target_site_id: this.props.targetSiteId,
			target_site_slug: this.props.targetSiteSlug,
			is_trial: isMigrationTrialSite( this.props.targetSite ),
		};

		if (
			prevState.migrationStatus !== MigrationStatus.BACKING_UP &&
			this.state.migrationStatus === MigrationStatus.BACKING_UP
		) {
			this.props.recordTracksEvent(
				'calypso_site_importer_import_progress_backing_up',
				trackEventProps
			);
		}

		if (
			prevState.migrationStatus !== MigrationStatus.RESTORING &&
			this.state.migrationStatus === MigrationStatus.RESTORING
		) {
			this.props.recordTracksEvent(
				'calypso_site_importer_import_progress_restoring',
				trackEventProps
			);
		}

		if (
			prevState.migrationStatus !== MigrationStatus.ERROR &&
			this.state.migrationStatus === MigrationStatus.ERROR
		) {
			this.props.recordTracksEvent( 'calypso_site_importer_import_failure', trackEventProps );
		}

		if (
			prevState.migrationStatus !== MigrationStatus.DONE_USER &&
			this.state.migrationStatus === MigrationStatus.DONE_USER
		) {
			this.props.recordTracksEvent( 'calypso_site_importer_import_users', trackEventProps );
		}

		if (
			prevState.migrationStatus !== MigrationStatus.DONE &&
			this.state.migrationStatus === MigrationStatus.DONE
		) {
			this.props.recordTracksEvent( 'calypso_site_importer_import_success', trackEventProps );
		}
	};

	handleFreeTrial = () => {
		this.props.stepNavigator?.goToCheckoutPage?.( 'everything', {
			siteSlug: this.props.targetSiteSlug,
			plan: PLAN_MIGRATION_TRIAL_MONTHLY,
		} );
	};

	renderLoading() {
		return (
			<div className="import-layout__center">
				<LoadingEllipsis />
			</div>
		);
	}

	renderMigrationConfirm() {
		const {
			sourceSite,
			targetSite,
			isTargetSitePlanCompatible,
			stepNavigator,
			isMigrateFromWp,
			onContentOnlySelection,
			translate,
			recordTracksEvent,
		} = this.props;

		if ( targetSite && targetSite.is_wpcom_staging_site ) {
			return (
				<NotAuthorized
					type="target-site-staging"
					onStartBuilding={ () => {
						recordTracksEvent( 'calypso_site_importer_skip_to_dashboard', {
							from: 'target-staging',
						} );
						stepNavigator.goToDashboardPage();
					} }
					onStartBuildingText={ translate( 'Skip to dashboard' ) }
				/>
			);
		}

		return (
			<>
				<Interval onTick={ this.updateSiteInfo } period={ EVERY_FIVE_SECONDS } />
				<PreMigrationScreen
					sourceSite={ sourceSite }
					targetSite={ targetSite }
					initImportRun={ this.props.initImportRun }
					isTrial={ isMigrationTrialSite( this.props.targetSite ) }
					isMigrateFromWp={ isMigrateFromWp }
					isTargetSitePlanCompatible={ isTargetSitePlanCompatible }
					startImport={ this.startMigration }
					navigateToVerifyEmailStep={ () => stepNavigator.goToVerifyEmailPage?.() }
					onContentOnlyClick={ onContentOnlySelection }
					onFreeTrialClick={ this.handleFreeTrial }
				/>
			</>
		);
	}

	renderMigrationProgress() {
		return (
			<div className="import-layout__center">
				<MigrationProgress
					status={ this.state.migrationStatus as MigrationStatus }
					fetchStatus={ this.updateFromAPI }
					// cast to unknown to avoid type error caused by passing state as props from jsx
					details={ this.state as unknown as MigrationState }
				/>
			</div>
		);
	}

	renderMigrationComplete() {
		const { isMigrateFromWp } = this.props;
		return ! isMigrateFromWp
			? this.renderMigrationSuccessScreen()
			: this.renderHoorayScreenWithDomainInfo();
	}

	renderMigrationError( status: MigrationStatusError | null = null ) {
		const { stepNavigator } = this.props;
		return (
			<div className="import-layout__center">
				<div>
					<MigrationError
						sourceSiteUrl={ this.props.sourceSite?.URL }
						targetSiteUrl={ this.props.targetSite.URL }
						targetSiteID={ this.props.targetSite.ID }
						status={ status || this.state.migrationErrorStatus }
						resetMigration={ this.resetMigration }
						goToImportCapturePage={ () => stepNavigator?.goToImportCapturePage?.() }
						goToImportContentOnlyPage={ () => stepNavigator?.goToImportContentOnlyPage?.() }
					/>
				</div>
			</div>
		);
	}

	renderMigrationSuccessScreen() {
		const { targetSite, recordTracksEvent } = this.props;
		return (
			<div className="import__heading import__heading-center migration-success">
				<AsyncLoad
					targetSite={ targetSite }
					recordTracksEvent={ recordTracksEvent }
					require="./migration-success"
				/>
			</div>
		);
	}

	renderHoorayScreenWithDomainInfo() {
		const { translate, stepNavigator, targetSite } = this.props;
		return (
			<Hooray>
				<div className="import__heading import__heading-center">
					<Title>{ translate( "Migration done! You're all set!" ) }</Title>
					<SubTitle>
						{ createInterpolateElement(
							translate(
								'You have a temporary domain name on WordPress.com.<br />We recommend updating your domain name.'
							),
							{ br: createElement( 'br' ) }
						) }
					</SubTitle>
					<DomainInfo domain={ targetSite.slug } />
					<DoneButton
						className="is-normal-width"
						label={ translate( 'Update domain name' ) }
						onSiteViewClick={ () => {
							this.props.recordTracksEvent( 'calypso_site_importer_click_add_domain' );
							stepNavigator?.goToAddDomainPage?.();
						} }
					/>
					<DoneButton
						className="is-normal-width"
						label={ translate( 'View your dashboard' ) }
						isPrimary={ false }
						onSiteViewClick={ () => {
							this.props.recordTracksEvent( 'calypso_site_importer_view_site' );
							stepNavigator?.goToSiteViewPage?.();
						} }
					/>
				</div>
			</Hooray>
		);
	}

	renderMigratingUsers() {
		const { targetSite } = this.props;
		return (
			<ImportUsers
				site={ targetSite }
				onSubmit={ () =>
					this.setState( {
						migrationStatus: 'done-user',
					} )
				}
			/>
		);
	}

	render() {
		if ( this.props.forceError ) {
			return this.renderMigrationError( this.props.forceError );
		}

		switch ( this.state.migrationStatus ) {
			case MigrationStatus.UNKNOWN:
				return this.renderLoading();

			case MigrationStatus.INACTIVE:
				return this.renderMigrationConfirm();

			case MigrationStatus.NEW:
			case MigrationStatus.BACKING_UP:
			case MigrationStatus.BACKING_UP_QUEUED:
			case MigrationStatus.RESTORING:
				return this.renderMigrationProgress();

			case MigrationStatus.DONE:
				return this.renderMigratingUsers();

			case MigrationStatus.DONE_USER:
				return this.renderMigrationComplete();

			case MigrationStatus.ERROR:
				return this.renderMigrationError();

			default:
				return null;
		}
	}
}

export const connector = connect(
	( state: IAppState, ownProps: Partial< Props > ) => {
		return {
			// to test different error states, we can pass in a migrationStatus and force an error
			forceError: get( getCurrentQueryArguments( state ), 'forceError', '' ),
			isTargetSiteAtomic: !! isSiteAutomatedTransfer( state, ownProps.targetSiteId as number ),
			isTargetSiteJetpack: !! isJetpackSite( state, ownProps.targetSiteId as number ),
			isTargetSitePlanCompatible: !! isTargetSitePlanCompatible( ownProps.targetSite ),
			sourceSite: ownProps.sourceSiteId && getSite( state, ownProps.sourceSiteId ),
			startMigration: !! get( getCurrentQueryArguments( state ), 'start', false ),
			sourceSiteHasJetpack: false,
			targetSiteId: ownProps.targetSiteId,
			targetSiteImportAdminUrl: getSiteAdminUrl(
				state,
				ownProps.targetSiteId as number,
				'import.php'
			),
		};
	},
	{
		receiveSite,
		updateSiteMigrationMeta,
		requestSite,
		recordTracksEvent,
	}
);

export default connector( localize( ImportEverything ) );
