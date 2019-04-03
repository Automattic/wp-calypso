/**
 * External dependencies
 */
import React from 'react';

const ImporterActionButtonContainer = ( { children } ) =>
	children ? <div className="importer-action-buttons__container">{ children }</div> : null;

ImporterActionButtonContainer.displayName = 'ImporterActionButtonContainer';

export default ImporterActionButtonContainer;
