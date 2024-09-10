import { Card, Spinner } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { fromActivityApi } from 'calypso/state/data-layer/wpcom/sites/activity/from-api';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import BackupDownloadFlow from './download';
import Error from './error';
import BackupGranularRestoreFlow from './granular-restore';
import Loading from './loading';
import BackupRestoreFlow from './restore';
import { RewindFlowPurpose } from './types';
import type { FunctionComponent, ReactNode } from 'react';

interface Activity {
	activityIsRewindable: boolean;
}

interface ActivityError {
	code?: string;
}

import './style.scss';

interface Props {
	rewindId: string;
	purpose: RewindFlowPurpose;
}

const BackupRewindFlow: FunctionComponent< Props > = ( { rewindId, purpose } ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const siteUrl = useSelector( ( state ) => ( siteId && getSiteUrl( state, siteId ) ) || '' );

	const activityQuery = useQuery< Activity, ActivityError >( {
		queryKey: [ 'activity', siteId, rewindId ],
		queryFn: () =>
			wpcom.req
				.get( {
					apiNamespace: 'wpcom/v2',
					path: `/sites/${ siteId }/activity/${ rewindId }`,
				} )
				.then( fromActivityApi ),
		retry: false,
	} );

	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ?? 0 ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ?? 0 ) );

	const wrapWithCard = ( content: ReactNode ) => <Card>{ content }</Card>;

	const render = () => {
		if ( null === applySiteOffset || ! activityQuery.isFetched ) {
			return wrapWithCard( <Loading /> );
		} else if ( activityQuery.error?.code === 'no_activity_for_site_and_rewind_id' ) {
			return wrapWithCard(
				<Error
					siteUrl={ siteUrl }
					errorText={ translate( 'The activity referenced by %(rewindId)s does not exist.', {
						args: { rewindId },
					} ) }
				/>
			);
		} else if ( activityQuery.data?.activityIsRewindable === false ) {
			return wrapWithCard(
				<Error
					siteUrl={ siteUrl }
					errorText={ translate( 'The activity referenced by %(rewindId)s is not rewindable.', {
						args: { rewindId },
					} ) }
				/>
			);
		} else if ( ! activityQuery.isSuccess ) {
			return wrapWithCard(
				<Error
					siteUrl={ siteUrl }
					errorText={ translate( 'An error occurred while trying to retrieve the activity' ) }
				/>
			);
		}

		const backupDisplayDate = applySiteOffset( moment( parseFloat( rewindId ) * 1000 ), {
			gmtOffset,
			timezone,
		} ).format( 'LLL' );
		if ( siteId && rewindId && backupDisplayDate ) {
			if ( purpose === RewindFlowPurpose.RESTORE ) {
				return (
					<BackupRestoreFlow
						backup={ activityQuery.data }
						backupDisplayDate={ backupDisplayDate }
						rewindId={ rewindId }
						siteId={ siteId }
						siteUrl={ siteUrl }
					/>
				);
			} else if ( purpose === RewindFlowPurpose.GRANULAR_RESTORE ) {
				return (
					<BackupGranularRestoreFlow
						backupDisplayDate={ backupDisplayDate }
						rewindId={ rewindId }
						siteId={ siteId }
						siteUrl={ siteUrl }
					/>
				);
			}

			// Default to RewindFlowPurpose.DOWNLOAD
			return (
				<BackupDownloadFlow
					backupDisplayDate={ backupDisplayDate }
					rewindId={ rewindId }
					siteId={ siteId }
					siteUrl={ siteUrl }
				/>
			);
		}

		// TODO: improve this placeholder
		return <Spinner />;
	};

	return (
		<Main className="rewind-flow">
			<DocumentHead
				title={
					purpose === RewindFlowPurpose.RESTORE ? translate( 'Restore' ) : translate( 'Download' )
				}
			/>
			{ isJetpackCloud() && <SidebarNavigation /> }
			<div className="rewind-flow__content">{ render() }</div>
		</Main>
	);
};

export { RewindFlowPurpose, BackupRewindFlow as default };
