/**
 * External dependencies
 */
import React from 'react';

const ActionButtonContainer = ( { children } ) =>
	children ? <div className="importer-action-buttons__container">{ children }</div> : null;

ActionButtonContainer.displayName = 'ActionButtonContainer';

export default ActionButtonContainer;
