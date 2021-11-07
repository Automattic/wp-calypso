import { Button } from '@automattic/components';
import classnames from 'classnames';

import './action-button.scss';

const ImporterActionButton = ( { className, ...props } ) => (
	<Button
		className={ classnames( 'importer-action-buttons__action-button', className ) }
		{ ...props }
	/>
);

ImporterActionButton.displayName = 'ImporterActionButton';

export default ImporterActionButton;
