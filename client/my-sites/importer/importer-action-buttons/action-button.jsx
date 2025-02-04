import { Button } from '@automattic/components';
import clsx from 'clsx';

import './action-button.scss';

const ImporterActionButton = ( props ) => (
	<Button
		className={ clsx( 'importer-action-buttons__action-button', props.className ) }
		{ ...props }
	/>
);

ImporterActionButton.displayName = 'ImporterActionButton';

export default ImporterActionButton;
