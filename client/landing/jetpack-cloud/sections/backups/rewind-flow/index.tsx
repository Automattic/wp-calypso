/**
 * External dependencies
 */
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useEffect } from 'react';

/**
 * Internal dependencies
 */
import {
	applySiteOffsetType,
	useApplySiteOffset,
} from 'landing/jetpack-cloud/components/site-offset';
import { Card } from '@automattic/components';
import { getHttpData } from 'state/data-layer/http-data';
import { getRequestActivityId, requestActivity } from 'state/data-getters';
import { getSelectedSiteId } from 'state/ui/selectors';
import { RewindFlowPurpose } from './types';
import { useLocalizedMoment } from 'components/localized-moment';
import BackupDownloadFlow from './download';
import BackupRestoreFlow from './restore';
import DocumentHead from 'components/data/document-head';
import Error from './error';
import getSiteUrl from 'state/sites/selectors/get-site-url';
import Loading from './loading';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Spinner from 'components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	rewindId: string;
	purpose: RewindFlowPurpose;
}

const BackupRewindFlow: FunctionComponent< Props > = ( { rewindId, purpose } ) => {
	const applySiteOffset = useApplySiteOffset();
	const moment = useLocalizedMoment();
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const siteUrl = useSelector( ( state ) => ( siteId && getSiteUrl( state, siteId ) ) || '' );

	const {
		state: activityRequestState,
		data: { activityIsRewindable } = { activityIsRewindable: undefined },
		error: activityRequestError,
	} = useSelector( () => getHttpData( getRequestActivityId( siteId, rewindId ) ) );

	const loadingActivity = ! [ 'success', 'failure' ].includes( activityRequestState );

	useEffect( () => {
		requestActivity( siteId, rewindId );
	}, [ siteId, rewindId ] );

	const renderContent = ( loadedApplySiteOffset: applySiteOffsetType ) => {
		const backupDisplayDate = loadedApplySiteOffset(
			moment( parseFloat( rewindId ) * 1000 )
		)?.format( 'LLL' );
		if ( siteId && rewindId && backupDisplayDate ) {
			return purpose === RewindFlowPurpose.RESTORE ? (
				<BackupRestoreFlow
					backupDisplayDate={ backupDisplayDate }
					rewindId={ rewindId }
					siteId={ siteId }
					siteUrl={ siteUrl }
				/>
			) : (
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

	const render = () => {
		if ( null === applySiteOffset || loadingActivity ) {
			return <Loading />;
		} else if ( activityRequestError?.code === 'no_activity_for_site_and_rewind_id' ) {
			return (
				<Error
					siteUrl={ siteUrl }
					errorText={ translate( 'The activity referenced by %(rewindId)s does not exist.', {
						args: { rewindId },
					} ) }
				/>
			);
		} else if ( activityIsRewindable === false ) {
			return (
				<Error
					siteUrl={ siteUrl }
					errorText={ translate( 'The activity referenced by %(rewindId)s is not rewindable.', {
						args: { rewindId },
					} ) }
				/>
			);
		}
		return renderContent( applySiteOffset );
	};

	return (
		<Main className="rewind-flow">
			<DocumentHead
				title={
					purpose === RewindFlowPurpose.RESTORE ? translate( 'Restore' ) : translate( 'Download' )
				}
			/>
			<SidebarNavigation />
			<Card>{ render() }</Card>
		</Main>
	);
};

export { RewindFlowPurpose, BackupRewindFlow as default };
