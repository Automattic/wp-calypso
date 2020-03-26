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
import { RewindFlowPurpose } from './types';
import BackupDownloadFlow from './download';
import BackupRestoreFlow from './restore';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	rewindId?: string;
	purpose: RewindFlowPurpose;
}

const BackupRewindFlow: FunctionComponent< Props > = ( { rewindId, purpose } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	const render = () => {
		if ( siteId && rewindId ) {
			return purpose === RewindFlowPurpose.RESTORE ? (
				<BackupRestoreFlow rewindId={ rewindId } siteId={ siteId } />
			) : (
				<BackupDownloadFlow rewindId={ rewindId } siteId={ siteId } />
			);
		}
		// TODO: good errors/placeholder here
		return <div />;
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
