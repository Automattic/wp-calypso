import { Button, CheckboxControl } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { useDispatch, useSelector } from 'calypso/state';
import { setNodeCheckState } from 'calypso/state/rewind/browser/actions';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import getBackupBrowserNode from 'calypso/state/rewind/selectors/get-backup-browser-node';
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
	onRequestGranularRestore: ( siteSlug: string, rewindId: number ) => void;
}

function FileBrowserHeader( {
	rewindId,
	showHeaderButtons = true,
	siteId,
	siteSlug,
	hasCredentials,
	isRestoreEnabled,
	onTrackEvent,
	onRequestGranularDownload,
	onRequestGranularRestore,
}: FileBrowserHeaderProps ) {
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
		onRequestGranularRestore( siteSlug, rewindId );
		onTrackEvent?.( 'calypso_jetpack_backup_browser_restore_multiple_files', {
			...( hasCredentials !== undefined && { has_credentials: hasCredentials } ),
		} );
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
				<ButtonStack justify="flex-start">
					<Button __next40pxDefaultSize onClick={ onDownloadClick }>
						{ __( 'Download selected files' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						onClick={ onRestoreClick }
						disabled={ ! isRestoreEnabled }
						variant="primary"
					>
						{ __( 'Restore selected files' ) }
					</Button>
				</ButtonStack>
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
}

export default FileBrowserHeader;
