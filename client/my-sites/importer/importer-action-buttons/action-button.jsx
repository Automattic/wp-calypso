/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const ActionButton = props => (
	<Button className="importer-action-buttons__action-button" { ...props } />
);

ActionButton.displayName = 'ActionButton';

export default ActionButton;
