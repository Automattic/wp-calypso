import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ProgressBar } from '@automattic/components';
import { Hooray, Progress, SubTitle, Title, NextButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { EVERY_TEN_SECONDS, Interval } from 'calypso/lib/interval';
import { SectionMigrate } from 'calypso/my-sites/migrate/section-migrate';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { SitesItem } from 'calypso/state/selectors/get-sites-items';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { receiveSite, requestSite, updateSiteMigrationMeta } from 'calypso/state/sites/actions';
import { getSite, getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import DoneButton from '../../components/done-button';
import GettingStartedVideo from '../../components/getting-started-video';
import NotAuthorized from '../../components/not-authorized';
import { isTargetSitePlanCompatible } from '../../util';
import { MigrationStatus } from '../types';
import { Confirm } from './confirm';
import type { StepNavigator } from 'calypso/blocks/importer/types';

interface Props {
	sourceSiteId: number | null;
	targetSite: SitesItem;
	targetSiteId: number | null;
	targetSiteSlug: string;
	targetSiteEligibleForProPlan: boolean;
	stepNavigator?: StepNavigator;
}

interface State {
	migrationStatus: string;
	percent: number | null;
}
export class ImportEverything extends SectionMigrate {
	componentDidUpdate( prevProps: any, prevState: State ) {
		super.componentDidUpdate( prevProps, prevState );

		if (
			prevState.migrationStatus !== MigrationStatus.BACKING_UP &&
			this.state.migrationStatus === MigrationStatus.BACKING_UP
		) {
			recordTracksEvent( 'calypso_site_importer_import_progress_backing_up' );
		}

		if (
			prevState.migrationStatus !== MigrationStatus.RESTORING &&
			this.state.migrationStatus === MigrationStatus.RESTORING
		) {
			recordTracksEvent( 'calypso_site_importer_import_progress_restoring' );
		}

		if (
			prevState.migrationStatus !== MigrationStatus.ERROR &&
			this.state.migrationStatus === MigrationStatus.ERROR
		) {
			recordTracksEvent( 'calypso_site_importer_import_failure' );
		}

		if (
			prevState.migrationStatus !== MigrationStatus.DONE &&
			this.state.migrationStatus === MigrationStatus.DONE
		) {
			recordTracksEvent( 'calypso_site_importer_import_success' );
		}
	}

	goToCart = () => {
		const { stepNavigator } = this.props;

		stepNavigator?.goToCheckoutPage();
	};

	resetMigration = () => {
		const { stepNavigator } = this.props;

		this.requestMigrationReset( this.props.targetSiteId ).finally( () => {
			stepNavigator?.goToImportCapturePage?.();
			/**
			 * Note this migrationStatus is local, thus the setState vs setMigrationState.
			 * Call to updateFromAPI will update both local and non-local state.
			 */
			this.setState(
				{
					migrationStatus: 'inactive',
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
	};

	renderLoading() {
		return <LoadingEllipsis />;
	}

	renderMigrationConfirm() {
		const {
			sourceSite,
			targetSite,
			targetSiteSlug,
			sourceUrlAnalyzedData,
			isTargetSitePlanCompatible,
			stepNavigator,
		} = this.props;

		if ( sourceSite ) {
			return (
				<Confirm
					startImport={ this.startMigration }
					isTargetSitePlanCompatible={ isTargetSitePlanCompatible }
					targetSite={ targetSite }
					targetSiteSlug={ targetSiteSlug }
					sourceSite={ sourceSite }
					sourceSiteUrl={ sourceSite.URL }
					sourceUrlAnalyzedData={ sourceUrlAnalyzedData }
				/>
			);
		}

		return (
			<NotAuthorized
				onStartBuilding={ stepNavigator?.goToIntentPage }
				onBackToStart={ stepNavigator?.goToImportCapturePage }
			/>
		);
	}

	renderMigrationProgress() {
		const { translate, sourceSite, targetSiteSlug } = this.props;

		return (
			<>
				<Progress>
					<Interval onTick={ this.updateFromAPI } period={ EVERY_TEN_SECONDS } />
					<Title>
						{ ( MigrationStatus.BACKING_UP === this.state.migrationStatus ||
							MigrationStatus.NEW === this.state.migrationStatus ) &&
							sprintf( translate( 'Backing up %(website)s' ), { website: sourceSite.slug } ) +
								'...' }
						{ MigrationStatus.RESTORING === this.state.migrationStatus &&
							sprintf( translate( 'Restoring to %(website)s' ), { website: targetSiteSlug } ) +
								'...' }
					</Title>
					<ProgressBar compact={ true } value={ this.state.percent ? this.state.percent : 0 } />
					<SubTitle>
						{ translate(
							"This may take a few minutes. We'll notify you by email when it's done."
						) }
					</SubTitle>
				</Progress>
				<GettingStartedVideo />
			</>
		);
	}

	renderMigrationComplete() {
		const { translate, stepNavigator } = this.props;

		return (
			<>
				<Hooray>
					<Title>{ translate( 'Hooray!' ) }</Title>
					<SubTitle>
						{ translate( 'Congratulations. Your content was successfully imported.' ) }
					</SubTitle>
					<DoneButton
						onSiteViewClick={ () => {
							recordTracksEvent( 'calypso_site_importer_view_site' );
							stepNavigator?.goToSiteViewPage?.();
						} }
					/>
				</Hooray>
				<GettingStartedVideo />
			</>
		);
	}

	renderMigrationError() {
		const { translate } = this.props;

		return (
			<div className={ classnames( 'import__header' ) }>
				<div className={ classnames( 'import__heading import__heading-center' ) }>
					<Title>{ translate( 'Import failed' ) }</Title>
					<SubTitle>
						{ translate( 'There was an error with your import.' ) }
						<br />
						{ translate( 'Please try again soon or contact support for help.' ) }
					</SubTitle>
					<div className={ classnames( 'import__buttons-group' ) }>
						<NextButton onClick={ this.resetMigration }>{ translate( 'Try again' ) }</NextButton>
					</div>
				</div>
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
			case MigrationStatus.RESTORING:
				return this.renderMigrationProgress();

			case MigrationStatus.DONE:
				return this.renderMigrationComplete();

			case MigrationStatus.ERROR:
				return this.renderMigrationError();

			default:
				return null;
		}
	}
}

export const connector = connect(
	( state, ownProps: Partial< Props > ) => {
		return {
			isTargetSiteAtomic: !! isSiteAutomatedTransfer( state, ownProps.targetSiteId as number ),
			isTargetSiteJetpack: !! isJetpackSite( state, ownProps.targetSiteId as number ),
			isTargetSitePlanCompatible: !! isTargetSitePlanCompatible( ownProps.targetSite as SitesItem ),
			sourceSite: ownProps.sourceSiteId && getSite( state, ownProps.sourceSiteId ),
			startMigration: !! get( getCurrentQueryArguments( state ), 'start', false ),
			sourceSiteHasJetpack: false,
			targetSiteId: ownProps.targetSiteId,
			targetSiteImportAdminUrl: getSiteAdminUrl(
				state,
				ownProps.targetSiteId as number,
				'import.php'
			),
			targetSiteEligibleForProPlan: isEligibleForProPlan( state, ownProps.targetSiteId as number ),
		};
	},
	{
		receiveSite,
		updateSiteMigrationMeta,
		requestSite,
	}
);

export default connector( localize( ImportEverything ) );
