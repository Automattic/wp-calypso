import { Button } from '@wordpress/components';
import { FunctionComponent, useState } from '@wordpress/element';
import { FileBrowserCheckTracker } from './types';

interface FileBrowserHeaderProps {
	controls: FileBrowserCheckTracker;
}

const FileBrowserHeader: FunctionComponent< FileBrowserHeaderProps > = ( { controls } ) => {
	const displayButtonLabel = () => {
		return controls.showCheckbox ? 'Disable Select' : 'Enable Select';
	};

	const [ buttonLabel, setButtonLabel ] = useState< string >( displayButtonLabel() );

	const onButtonClick = () => {
		controls.showCheckbox = ! controls.showCheckbox;
		setButtonLabel( displayButtonLabel() );
	};

	return (
		<div className="file-browser-header">
			<Button className="file-browser-header__select-button" onClick={ onButtonClick } isSecondary>
				{ buttonLabel }
			</Button>
		</div>
	);
};

export default FileBrowserHeader;
