import { ProgressBar } from '@automattic/components';
import { Hooray, Progress, SubTitle, Title } from '@automattic/onboarding';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { SectionMigrate } from 'calypso/my-sites/migrate/section-migrate';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { receiveSite, requestSite, updateSiteMigrationMeta } from 'calypso/state/sites/actions';
import { getSite, getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { MigrationStatus } from '../types';
import { ImportEverything } from './index';

interface Props {
	sourceSiteId: number | null;
	targetSiteId: number | null;
	targetSiteSlug: string;
}
export class MigrationScreen extends SectionMigrate {
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
							{ /*{ TODO: switch title based on progress type }*/ }
							{ translate( 'Importing' ) }...
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
						{ /*{ TODO: add missing "View site" -> DONE button }*/ }
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
