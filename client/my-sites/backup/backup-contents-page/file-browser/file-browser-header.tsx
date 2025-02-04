import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { backupDownloadPath } from 'calypso/my-sites/backup/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindRequestGranularBackup } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { hasJetpackCredentials } from 'calypso/state/jetpack/credentials/selectors';
import { setNodeCheckState } from 'calypso/state/rewind/browser/actions';
import canRestoreSite from 'calypso/state/rewind/selectors/can-restore-site';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import getBackupBrowserNode from 'calypso/state/rewind/selectors/get-backup-browser-node';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { backupGranularRestorePath } from '../../paths';
import { FileBrowserCheckState } from './types';

interface FileBrowserHeaderProps {
	rewindId: number;
}

const FileBrowserHeader: FunctionComponent< FileBrowserHeaderProps > = ( { rewindId } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const rootNode = useSelector( ( state ) => getBackupBrowserNode( state, siteId, '/' ) );
	const browserCheckList = useSelector( ( state ) => getBackupBrowserCheckList( state, siteId ) );
	const isRestoreDisabled = useSelector( ( state ) => ! canRestoreSite( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;
	const hasCredentials = useSelector( ( state ) => hasJetpackCredentials( state, siteId ) );

	const onDownloadClick = () => {
		const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		dispatch( rewindRequestGranularBackup( siteId, rewindId, includePaths, excludePaths ) );
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_browser_download_multiple_files' ) );
		page.redirect( backupDownloadPath( siteSlug, rewindId as unknown as string ) );
	};
	const onRestoreClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_browser_restore_multiple_files', {
				has_credentials: hasCredentials,
			} )
		);
		page.redirect( backupGranularRestorePath( siteSlug, rewindId as unknown as string ) );
	};
	// When the checkbox is clicked, we'll update the check state in the state
	const updateNodeCheckState = useCallback(
		( siteId: number, path: string, checkState: FileBrowserCheckState ) => {
			dispatch( setNodeCheckState( siteId, path, checkState ) );
		},
		[ dispatch ]
	);

	// A simple toggle.  Mixed will go to unchecked.
	const onCheckboxChange = () => {
		updateNodeCheckState(
			siteId,
			'/',
			rootNode && rootNode.checkState === 'unchecked' ? 'checked' : 'unchecked'
		);
	};

	return (
		<div className="file-browser-header">
			{ browserCheckList.totalItems > 0 && (
				<div className="file-browser-header__action-buttons">
					<Button className="file-browser-header__download-button" onClick={ onDownloadClick }>
						{ translate( 'Download selected files' ) }
					</Button>
					<Button
						className="file-browser-header__restore-button"
						onClick={ onRestoreClick }
						disabled={ isRestoreDisabled }
						primary
					>
						{ translate( 'Restore selected files' ) }
					</Button>
				</div>
			) }
			<div className="file-browser-header__selecting">
				<CheckboxControl
					__nextHasNoMarginBottom
					checked={ rootNode ? rootNode.checkState === 'checked' : false }
					indeterminate={ rootNode && rootNode.checkState === 'mixed' }
					onChange={ onCheckboxChange }
					className={ `${ rootNode && rootNode.checkState === 'mixed' ? 'mixed' : '' }` }
				/>
				<div className="file-browser-header__selecting-info">
					{ browserCheckList.totalItems } { translate( 'files selected' ) }
				</div>
			</div>
		</div>
	);
};

export default FileBrowserHeader;
