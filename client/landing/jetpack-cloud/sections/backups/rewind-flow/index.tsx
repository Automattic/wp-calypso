/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSiteUrl from 'state/sites/selectors/get-site-url';
import { RewindFlowPurpose } from './types';
import {
	applySiteOffsetType,
	useApplySiteOffset,
} from 'landing/jetpack-cloud/components/site-offset';
import BackupDownloadFlow from './download';
import BackupRestoreFlow from './restore';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import Spinner from 'components/spinner';
import { useLocalizedMoment } from 'components/localized-moment';

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

	const render = ( loadedApplySiteOffset: applySiteOffsetType ) => {
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

	return (
		<Main className="rewind-flow">
			<DocumentHead
				title={
					purpose === RewindFlowPurpose.RESTORE ? translate( 'Restore' ) : translate( 'Download' )
				}
			/>
			<SidebarNavigation />
			<Card>{ applySiteOffset && render( applySiteOffset ) }</Card>
		</Main>
	);
};

export { RewindFlowPurpose, BackupRewindFlow as default };
