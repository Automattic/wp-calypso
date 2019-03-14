/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const ImporterActionButton = props => (
	<Button className="importer-action-buttons__action-button" { ...props } />
);

ImporterActionButton.displayName = 'ImporterActionButton';

export default ImporterActionButton;
