/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

const DomainPickerSuggestionItemPlaceholder: FunctionComponent = () => {
	return (
		<div className="domain-picker__suggestion-item placeholder">
			<div className="domain-picker__suggestion-item-name placeholder" />
			<div className="domain-picker__price placeholder"></div>
		</div>
	);
};

export default DomainPickerSuggestionItemPlaceholder;
