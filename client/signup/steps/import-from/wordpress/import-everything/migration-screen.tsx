import { ProgressBar } from '@automattic/components';
import { Hooray, Progress, SubTitle, Title } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import page from 'page';
import React from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { addQueryArgs } from 'calypso/lib/route';
import { SectionMigrate } from 'calypso/my-sites/migrate/section-migrate';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { receiveSite, requestSite, updateSiteMigrationMeta } from 'calypso/state/sites/actions';
import { getSite, getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import DoneButton from '../../components/done-button';
import { MigrationStatus, MigrationStep } from '../types';
import { ImportEverything } from './index';

interface Props {
	sourceSiteId: number | null;
	targetSiteId: number | null;
	targetSiteSlug: string;
}
export class MigrationScreen extends SectionMigrate {
	getMigrationUrlPath = () => {
		const { sourceSite, targetSiteSlug } = this.props;
		const sourceSiteSlug = get( sourceSite, 'slug' );

		const path = '/start/from/importing/wordpress';
		const queryParams = {
			from: sourceSiteSlug,
			to: targetSiteSlug,
			step: MigrationStep.CONFIRM,
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

	goToCart = () => {
		page( this.getCheckoutUrlPath( this.getMigrationUrlPath() ) );
	};

	render() {
		const { sourceSite, targetSite, targetSiteSlug, fromSiteAnalyzedData, translate } = this.props;

		switch ( this.state.migrationStatus ) {
			case MigrationStatus.UNKNOWN:
				return <LoadingEllipsis />;

			case MigrationStatus.INACTIVE:
				// TODO: Rename field names. It should be consistent through the screens
				return (
					<ImportEverything
						startImport={ this.startMigration }
						siteItem={ targetSite }
						siteSlug={ targetSiteSlug }
						fromSite={ sourceSite.URL }
						fromSiteItem={ sourceSite }
						fromSiteAnalyzedData={ fromSiteAnalyzedData }
					/>
				);

			case MigrationStatus.NEW:
			case MigrationStatus.BACKING_UP:
			case MigrationStatus.RESTORING:
				return (
					<Progress>
						<Title>
							{ ( MigrationStatus.BACKING_UP === this.state.migrationStatus ||
								MigrationStatus.NEW === this.state.migrationStatus ) &&
								sprintf( translate( 'Backing up %(website)s' ), { website: sourceSite.slug } ) }
							...
							{ MigrationStatus.RESTORING === this.state.migrationStatus &&
								sprintf( translate( 'Restoring to %(website)s' ), { website: targetSiteSlug } ) }
							...
						</Title>
						<ProgressBar
							color={ 'black' }
							compact={ true }
							value={ Number.isNaN( this.state.percent ) ? 0 : this.state.percent }
						/>
						<SubTitle>
							{ translate(
								"This may take a few minutes. We'll notify you by email when it's done."
							) }
						</SubTitle>
					</Progress>
				);

			case MigrationStatus.DONE:
				return (
					<Hooray>
						<Title>{ translate( 'Hooray!' ) }</Title>
						<SubTitle>
							{ translate( 'Congratulations. Your content was successfully imported.' ) }
						</SubTitle>
						<DoneButton siteSlug={ targetSiteSlug } />
					</Hooray>
				);

			default:
				return null;
		}
	}
}

const navigateToSelectedSourceSite = () => {
	// navigateToSelectedSourceSite
};

export const connector = connect(
	( state, ownProps: Partial< Props > ) => {
		return {
			isTargetSiteAtomic: !! isSiteAutomatedTransfer( state, ownProps.targetSiteId as number ),
			isTargetSiteJetpack: !! isJetpackSite( state, ownProps.targetSiteId as number ),
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
		navigateToSelectedSourceSite,
		receiveSite,
		updateSiteMigrationMeta,
		requestSite,
		recordTracksEvent,
	}
);

export default connector( localize( MigrationScreen ) );
