import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import BulkSelect from 'calypso/components/bulk-select';

interface FileBrowserHeaderProps {
	setShowCheckboxes: ( enabled: boolean ) => void;
	showCheckboxes: boolean;
	currentlySelected: number;
	totalElements: number;
	onToggleAll: ( checkedState?: boolean ) => void;
}

const FileBrowserHeader: FunctionComponent< FileBrowserHeaderProps > = ( {
	setShowCheckboxes,
	showCheckboxes,
	currentlySelected,
	totalElements,
	onToggleAll,
} ) => {
	const translate = useTranslate();
	const onSelectClick = () => {
		setShowCheckboxes( true );
	};
	const onCancelClick = () => {
		setShowCheckboxes( false );
	};
	const onDownloadClick = () => {
		alert( 'Not yet implemented' );
	};
	const onRestoreClick = () => {
		alert( 'Not yet implemented' );
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
					<BulkSelect
						className="file-browser-header__bulk-select"
						totalElements={ totalElements }
						selectedElements={ currentlySelected }
						onToggle={ onToggleAll }
					/>
					<div className="file-browser-header__selecting-info">
						{ translate( 'files selected' ) }
					</div>
					<Button
						className="file-browser-header__download-button"
						onClick={ onDownloadClick }
						compact
						disabled={ currentlySelected === 0 }
					>
						{ translate( 'Download files' ) }
					</Button>
					<Button
						className="file-browser-header__restore-button"
						onClick={ onRestoreClick }
						primary
						compact
						disabled={ currentlySelected === 0 }
					>
						{ translate( 'Restore files' ) }
					</Button>
					<Button
						className="file-browser-header__cancel-button"
						onClick={ onCancelClick }
						borderless
						compact
					>
						<Gridicon icon="cross" />
					</Button>
				</div>
			) }
		</div>
	);
};

export default FileBrowserHeader;
