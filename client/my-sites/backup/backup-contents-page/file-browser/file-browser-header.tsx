import { Button } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { FunctionComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { useDispatch, useSelector } from 'calypso/state';
import { setNodeCheckState } from 'calypso/state/rewind/browser/actions';
import getBackupBrowserCheckList from 'calypso/state/rewind/selectors/get-backup-browser-check-list';
import getBackupBrowserNode from 'calypso/state/rewind/selectors/get-backup-browser-node';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { backupGranularRestorePath } from '../../paths';
import { FileBrowserCheckState } from './types';

interface FileBrowserHeaderProps {
	setShowCheckboxes: ( enabled: boolean ) => void;
	showCheckboxes: boolean;
	rewindId: number;
}

const FileBrowserHeader: FunctionComponent< FileBrowserHeaderProps > = ( {
	setShowCheckboxes,
	showCheckboxes,
	rewindId,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const rootNode = useSelector( ( state ) => getBackupBrowserNode( state, siteId, '/' ) );
	const browserCheckList = useSelector( ( state ) => getBackupBrowserCheckList( state, siteId ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) ) as string;

	const onSelectClick = () => {
		setShowCheckboxes( true );
	};
	const onCancelClick = () => {
		setShowCheckboxes( false );
	};
	const onDownloadClick = () => {
		// eslint-disable-next-line no-console
		console.log( browserCheckList );
	};
	const onRestoreClick = () => {
		// TODO: Add tracking
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
			{ ! showCheckboxes && (
				<div className="file-browser-header__select">
					<Button className="file-browser-header__select-button" onClick={ onSelectClick } compact>
						{ translate( 'Select' ) }
					</Button>
					<div className="file-browser-header__select-info">
						{ translate( 'Select individual files to restore or download' ) }
					</div>
				</div>
			) }
			{ showCheckboxes && (
				<div className="file-browser-header__selecting">
					<FormCheckbox
						checked={
							rootNode
								? rootNode.checkState === 'checked' || rootNode.checkState === 'mixed'
								: false
						}
						onChange={ onCheckboxChange }
						className={ `${ rootNode && rootNode.checkState === 'mixed' ? 'mixed' : '' }` }
					/>
					<div className="file-browser-header__selecting-info">
						{ browserCheckList.totalItems } { translate( 'files selected' ) }
					</div>
					<Button
						className="file-browser-header__download-button"
						onClick={ onDownloadClick }
						compact
						disabled={ browserCheckList.totalItems === 0 }
					>
						{ translate( 'Download files' ) }
					</Button>
					<Button
						className="file-browser-header__restore-button"
						onClick={ onRestoreClick }
						primary
						compact
						disabled={ browserCheckList.totalItems === 0 }
					>
						{ translate( 'Restore files' ) }
					</Button>
					<Button
						className="file-browser-header__cancel-button"
						onClick={ onCancelClick }
						borderless
						compact
					>
						<Icon icon={ close } />
					</Button>
				</div>
			) }
		</div>
	);
};

export default FileBrowserHeader;
