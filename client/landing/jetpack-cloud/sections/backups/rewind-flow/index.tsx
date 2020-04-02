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
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import { isRequestingSiteSettings } from 'state/site-settings/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { RewindFlowPurpose } from './types';
import BackupDownloadFlow from './download';
import BackupRestoreFlow from './restore';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import QuerySiteSettings from 'components/data/query-site-settings'; // Required to get site time offset
import { applySiteOffset } from 'lib/site/timezone';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	rewindId: string;
	purpose: RewindFlowPurpose;
}

const BackupRewindFlow: FunctionComponent< Props > = ( { rewindId, purpose } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	const timezone = useSelector( state =>
		siteId !== null ? getSiteTimezoneValue( state, siteId ) : null
	);
	const gmtOffset = useSelector( state =>
		siteId !== null ? getSiteGmtOffset( state, siteId ) : null
	);

	const isSiteSettingLoading = useSelector( state =>
		siteId !== null ? isRequestingSiteSettings( state, siteId ) : true
	);

	const backupDisplayDate = applySiteOffset( parseFloat( rewindId ) * 1000, {
		timezone,
		gmtOffset,
	} ).format( 'LLL' );

	const render = () => {
		if ( siteId && rewindId ) {
			return purpose === RewindFlowPurpose.RESTORE ? (
				<BackupRestoreFlow
					backupDisplayDate={ backupDisplayDate }
					rewindId={ rewindId }
					siteId={ siteId }
				/>
			) : (
				<BackupDownloadFlow
					backupDisplayDate={ backupDisplayDate }
					rewindId={ rewindId }
					siteId={ siteId }
				/>
			);
		}
		// TODO: good errors/placeholder here
		return <div />;
	};

	return (
		<Main className="rewind-flow">
			<QuerySiteSettings siteId={ siteId } />
			<DocumentHead
				title={
					purpose === RewindFlowPurpose.RESTORE ? translate( 'Restore' ) : translate( 'Download' )
				}
			/>
			<SidebarNavigation />
			{ ! isSiteSettingLoading && <Card>{ render() }</Card> }
		</Main>
	);
};

export { RewindFlowPurpose, BackupRewindFlow as default };
