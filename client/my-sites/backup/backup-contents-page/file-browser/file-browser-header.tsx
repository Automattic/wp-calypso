import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';

interface FileBrowserHeaderProps {
	setShowCheckboxes: ( enabled: boolean ) => void;
	showCheckboxes: boolean;
}

const FileBrowserHeader: FunctionComponent< FileBrowserHeaderProps > = ( {
	setShowCheckboxes,
	showCheckboxes,
} ) => {
	const translate = useTranslate();
	const onSelectClick = () => {
		setShowCheckboxes( true );
	};
	const onCancelClick = () => {
		setShowCheckboxes( false );
	};

	return (
		<div className="file-browser-header">
			{ ! showCheckboxes && (
				<Button
					className="file-browser-header__select-button"
					onClick={ onSelectClick }
					variant="secondary"
				>
					{ translate( 'Select' ) }
				</Button>
			) }
			{ showCheckboxes && (
				<Button
					className="file-browser-header__cancel-button"
					icon={ close }
					onClick={ onCancelClick }
					variant="secondary"
				/>
			) }
		</div>
	);
};

export default FileBrowserHeader;
