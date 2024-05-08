import { Button } from '@automattic/components';
import clsx from 'clsx';

import './action-button.scss';

const ImporterActionButton = ( { className, ...props } ) => (
	<Button className={ clsx( 'importer-action-buttons__action-button', className ) } { ...props } />
);

ImporterActionButton.displayName = 'ImporterActionButton';

export default ImporterActionButton;
