import { ProgressBar } from '@automattic/components';
import { MigrationStatus, MigrationStatusError, type SiteDetails } from '@automattic/data-stores';
import { Hooray, NextButton, Progress, SubTitle, Title } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { connect } from 'react-redux';
import PreMigrationScreen from 'calypso/blocks/importer/wordpress/import-everything/pre-migration';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { EVERY_FIVE_SECONDS, EVERY_TEN_SECONDS, Interval } from 'calypso/lib/interval';
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
import GettingStartedVideo from '../../components/getting-started-video';
import NotAuthorized from '../../components/not-authorized';
import { isTargetSitePlanCompatible } from '../../util';
import { WPImportOption } from '../types';
import { clearMigrateSource, retrieveMigrateSource } from '../utils';
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

interface State {
	migrationStatus: MigrationStatus;
	migrationErrorStatus: MigrationStatusError;
	percent: number | null;
}

type ExtraParams = {
	[ key: string ]: any;
};

export class ImportEverything extends SectionMigrate {
	componentDidUpdate( prevProps: any, prevState: State ) {
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

	recordMigrationStatusChange = ( prevState: State ) => {
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
			prevState.migrationStatus !== MigrationStatus.DONE &&
			this.state.migrationStatus === MigrationStatus.DONE
		) {
			this.props.recordTracksEvent( 'calypso_site_importer_import_success', trackEventProps );
		}
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
					onNotAuthorizedClick={ () => {
						recordTracksEvent( 'calypso_site_importer_skip_to_dashboard', {
							from: 'pre-migration',
						} );
						stepNavigator?.goToDashboardPage();
					} }
				/>
			</>
		);
	}

	renderMigrationProgress() {
		const { translate } = this.props;

		return (
			<div className="import-layout__center">
				<Progress>
					<Interval onTick={ this.updateFromAPI } period={ EVERY_TEN_SECONDS } />
					<div className="import__heading import__heading-center">
						<Title>{ this.getTitle() }</Title>
						<ProgressBar compact={ true } value={ this.state.percent ? this.state.percent : 0 } />
						<SubTitle>
							{ translate(
								"This may take a few minutes. We'll notify you by email when it's done."
							) }
						</SubTitle>
					</div>
				</Progress>
				<GettingStartedVideo />
			</div>
		);
	}

	renderMigrationProgressSimple() {
		const { translate } = this.props;

		return (
			<div className="import-layout__center">
				<Progress className="onboarding-progress-simple">
					<Interval onTick={ this.updateFromAPI } period={ EVERY_TEN_SECONDS } />
					<div className="import__heading import__heading-center">
						<Title>{ translate( 'We’re safely migrating all your data' ) }</Title>
						<ProgressBar compact={ true } value={ this.state.percent ? this.state.percent : 0 } />
						<SubTitle tagName="h3">
							{ translate(
								'Feel free to close this window. We’ll email you when your new site is ready.'
							) }
						</SubTitle>
					</div>
				</Progress>
			</div>
		);
	}

	renderMigrationComplete() {
		const { isMigrateFromWp } = this.props;
		return (
			<Hooray>
				{ ! isMigrateFromWp
					? this.renderDefaultHoorayScreen()
					: this.renderHoorayScreenWithDomainInfo() }
			</Hooray>
		);
	}

	renderMigrationError() {
		const { translate } = this.props;

		return (
			<div className="import-layout__center">
				<div>
					<div className="import__heading import__heading-center">
						<Title>{ translate( 'Import failed' ) }</Title>
						<SubTitle>
							{ this.getErrorTitle() }
							<br />
							{ translate( 'Please try again soon or contact support for help.' ) }
						</SubTitle>
						<div className="import__buttons-group">
							<NextButton onClick={ this.resetMigration }>{ translate( 'Try again' ) }</NextButton>
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderDefaultHoorayScreen() {
		const { translate, stepNavigator } = this.props;

		return (
			<div className="import__heading import__heading-center">
				<Title>{ translate( 'Hooray!' ) }</Title>
				<SubTitle>
					{ translate( 'Congratulations. Your content was successfully imported.' ) }
				</SubTitle>
				<DoneButton
					label={ translate( 'View site' ) }
					onSiteViewClick={ () => {
						this.props.recordTracksEvent( 'calypso_site_importer_view_site' );
						stepNavigator?.goToSiteViewPage?.();
					} }
				/>
			</div>
		);
	}

	renderHoorayScreenWithDomainInfo() {
		const { translate, stepNavigator, targetSite } = this.props;
		return (
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
		);
	}

	render() {
		switch ( this.state.migrationStatus ) {
			case MigrationStatus.UNKNOWN:
				return this.renderLoading();

			case MigrationStatus.INACTIVE:
				return this.renderMigrationConfirm();

			case MigrationStatus.NEW:
			case MigrationStatus.BACKING_UP:
			case MigrationStatus.BACKING_UP_QUEUED:
			case MigrationStatus.RESTORING:
				return this.renderMigrationProgressSimple();

			case MigrationStatus.DONE:
				return this.renderMigrationComplete();

			case MigrationStatus.ERROR:
				return this.renderMigrationError();

			default:
				return null;
		}
	}

	getTitle(): string {
		const { translate, sourceSite, targetSite } = this.props;

		switch ( this.state.migrationStatus ) {
			case MigrationStatus.BACKING_UP:
			case MigrationStatus.BACKING_UP_QUEUED:
			case MigrationStatus.NEW:
				return (
					sprintf( translate( 'Backing up %(website)s' ), { website: sourceSite.slug } ) + '...'
				);

			case MigrationStatus.RESTORING:
				return (
					sprintf( translate( 'Restoring to %(website)s' ), { website: targetSite.slug } ) + '...'
				);

			default:
				return '';
		}
	}

	getErrorTitle(): string {
		const { translate } = this.props;

		if ( this.state.migrationStatus !== MigrationStatus.ERROR ) {
			return '';
		}

		switch ( this.state.migrationErrorStatus as unknown as MigrationStatusError ) {
			// Start of migration #1
			case MigrationStatusError.ACTIVATE_REWIND:
			case MigrationStatusError.BACKUP_QUEUEING:
				return translate( 'Impossible to start the migration.' );

			// Start of backup
			// eslint-disable-next-line inclusive-language/use-inclusive-words
			case MigrationStatusError.MISSING_SOURCE_MASTER_USER:
				return translate( 'Impossible to start the backup.' );

			// During backup
			case MigrationStatusError.NO_BACKUP_STATUS:
			case MigrationStatusError.BACKUP_SITE_NOT_ACCESSIBLE:
			case MigrationStatusError.BACKUP_UNKNOWN:
				return translate( 'There was an error during the backup.' );

			// End of backup #1
			case MigrationStatusError.WOA_GET_TRANSFER_RECORD:
			case MigrationStatusError.MISSING_WOA_CREDENTIALS:
				return translate( 'There was an error during the backup.' );

			// Start of restore
			case MigrationStatusError.RESTORE_QUEUE:
			case MigrationStatusError.RESTORE_FAILED:
				return translate( 'There was an error to start the restore.' );

			// During restore
			case MigrationStatusError.RESTORE_STATUS:
				return translate( 'There was an error during the restore.' );

			// End of restore
			case MigrationStatusError.FIX_EXTERNAL_USER_ID:
			case MigrationStatusError.GET_SOURCE_EXTERNAL_USER_ID:
			case MigrationStatusError.GET_USER_TOKEN:
			case MigrationStatusError.UPDATE_TARGET_USER_TOKEN:
				return translate( 'There was an error at the end of the restore.' );

			// Start of migration #2
			// End of backup #2
			case MigrationStatusError.WOA_TRANSFER:
				return translate( 'Impossible to perform the migration.' );

			case MigrationStatusError.GENERAL:
			default:
				return translate( 'There was an error with your import.' );
		}
	}
}

export const connector = connect(
	( state: IAppState, ownProps: Partial< Props > ) => {
		return {
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
