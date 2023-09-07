import { Button } from '@automattic/components';
import { useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { useDispatch, useSelector } from 'calypso/state';
import { setNodeCheckState } from 'calypso/state/rewind/browser/actions';
import canRestoreSite from 'calypso/state/rewind/selectors/can-restore-site';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import getBackupBrowserNode from 'calypso/state/rewind/selectors/get-backup-browser-node';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { FileBrowserCheckState } from './types';

const FileBrowserHeader: FunctionComponent = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const rootNode = useSelector( ( state ) => getBackupBrowserNode( state, siteId, '/' ) );
	const browserCheckList = useSelector( ( state ) => getBackupBrowserCheckList( state, siteId ) );
	const isRestoreDisabled = useSelector( ( state ) => ! canRestoreSite( state, siteId ) );

	const onDownloadClick = () => {
		// eslint-disable-next-line no-console
		console.log( browserCheckList );
	};
	const onRestoreClick = () => {
		alert( 'Not yet implemented' );
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
				<FormCheckbox
					checked={
						rootNode ? rootNode.checkState === 'checked' || rootNode.checkState === 'mixed' : false
					}
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
