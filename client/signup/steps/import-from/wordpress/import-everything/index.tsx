import { ProgressBar } from '@automattic/components';
import { Hooray, Progress, SubTitle, Title, NextButton } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import React from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { EVERY_TEN_SECONDS, Interval } from 'calypso/lib/interval';
import { addQueryArgs } from 'calypso/lib/route';
import { SectionMigrate } from 'calypso/my-sites/migrate/section-migrate';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { SitesItem } from 'calypso/state/selectors/get-sites-items';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { receiveSite, requestSite, updateSiteMigrationMeta } from 'calypso/state/sites/actions';
import { getSite, getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import DoneButton from '../../components/done-button';
import GettingStartedVideo from '../../components/getting-started-video';
import NotAuthorized from '../../components/not-authorized';
import { isTargetSitePlanCompatible } from '../../util';
import { MigrationStatus, WPImportOption } from '../types';
import { Confirm } from './confirm';

interface Props {
	sourceSiteId: number | null;
	targetSite: SitesItem;
	targetSiteId: number | null;
	targetSiteSlug: string;
}
export class ImportEverything extends SectionMigrate {
	getMigrationUrlPath = () => {
		const { sourceSite, targetSiteSlug } = this.props;
		const sourceSiteSlug = get( sourceSite, 'slug' );

		const path = '/start/from/importing/wordpress';
		const queryParams = {
			from: sourceSiteSlug,
			to: targetSiteSlug,
			option: WPImportOption.EVERYTHING,
			run: true,
		};

		return addQueryArgs( queryParams, path );
	};

	getCheckoutUrlPath = ( redirectTo: string ) => {
		const { targetSiteSlug } = this.props;
		const path = `/checkout/${ targetSiteSlug }/business`;
		const queryParams = { redirect_to: redirectTo };

		return addQueryArgs( queryParams, path );
	};

	getCaptureUrlPath = () => {
		const { targetSiteSlug } = this.props;
		const path = '/start/importer/capture';
		const queryParams = { siteSlug: targetSiteSlug };

		return addQueryArgs( queryParams, path );
	};

	goToCart = () => {
		page( this.getCheckoutUrlPath( this.getMigrationUrlPath() ) );
	};

	goToCapture = () => {
		page( this.getCaptureUrlPath() );
	};

	resetMigration = () => {
		this.requestMigrationReset( this.props.targetSiteId ).finally( () => {
			this.goToCapture();
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

		return <NotAuthorized siteSlug={ targetSiteSlug } />;
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
					<ProgressBar
						color={ 'black' }
						compact={ true }
						value={ this.state.percent ? this.state.percent : 0 }
					/>
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
		const { translate, targetSiteSlug } = this.props;

		return (
			<>
				<Hooray>
					<Title>{ translate( 'Hooray!' ) }</Title>
					<SubTitle>
						{ translate( 'Congratulations. Your content was successfully imported.' ) }
					</SubTitle>
					<DoneButton siteSlug={ targetSiteSlug } />
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
