import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { CheckboxControl } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { setNodeCheckState } from 'calypso/state/rewind/browser/actions';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import getBackupBrowserNode from 'calypso/state/rewind/selectors/get-backup-browser-node';
import { backupGranularRestorePath } from '../../paths';
import { FileBrowserCheckState } from './types';

interface FileBrowserHeaderProps {
	rewindId: number;
	showHeaderButtons?: boolean;
	siteId: number;
	siteSlug: string;
	hasCredentials?: boolean;
	isRestoreEnabled?: boolean;
	onTrackEvent?: ( eventName: string, properties?: Record< string, unknown > ) => void;
	onRequestGranularDownload?: (
		siteId: number,
		rewindId: number,
		includePaths: string,
		excludePaths: string
	) => void;
}

const FileBrowserHeader: FunctionComponent< FileBrowserHeaderProps > = ( {
	rewindId,
	showHeaderButtons = true,
	siteId,
	siteSlug,
	hasCredentials,
	isRestoreEnabled,
	onTrackEvent,
	onRequestGranularDownload,
} ) => {
	const dispatch = useDispatch();
	const rootNode = useSelector( ( state ) => getBackupBrowserNode( state, siteId, '/' ) );
	const browserCheckList = useSelector( ( state ) => getBackupBrowserCheckList( state, siteId ) );

	const onDownloadClick = () => {
		const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		onRequestGranularDownload?.( siteId, rewindId, includePaths, excludePaths );
		onTrackEvent?.( 'calypso_jetpack_backup_browser_download_multiple_files' );
	};
	const onRestoreClick = () => {
		onTrackEvent?.( 'calypso_jetpack_backup_browser_restore_multiple_files', {
			...( hasCredentials !== undefined && { has_credentials: hasCredentials } ),
		} );
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
			{ showHeaderButtons && browserCheckList.totalItems > 0 && (
				<div className="file-browser-header__action-buttons">
					<Button className="file-browser-header__download-button" onClick={ onDownloadClick }>
						{ __( 'Download selected files' ) }
					</Button>
					<Button
						className="file-browser-header__restore-button"
						onClick={ onRestoreClick }
						disabled={ ! isRestoreEnabled }
						primary
					>
						{ __( 'Restore selected files' ) }
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
					{ browserCheckList.totalItems } { __( 'files selected' ) }
				</div>
			</div>
		</div>
	);
};

export default FileBrowserHeader;
