/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './action-button.scss';

const ImporterActionButton = ( { className, ...props } ) => (
	<Button
		className={ classnames( 'importer-action-buttons__action-button', className ) }
		{ ...props }
	/>
);

ImporterActionButton.displayName = 'ImporterActionButton';

export default ImporterActionButton;
