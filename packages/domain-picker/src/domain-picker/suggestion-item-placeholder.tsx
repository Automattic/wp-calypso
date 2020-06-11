/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

const DomainPickerSuggestionItemPlaceholder: FunctionComponent = () => {
	return (
		<div className="domain-picker__suggestion-item">
			<input disabled className="domain-picker__suggestion-radio-button" type="radio" />
			<div className="domain-picker__suggestion-item-name placeholder" />
			<div className="domain-picker__price placeholder"></div>
		</div>
	);
};

export default DomainPickerSuggestionItemPlaceholder;
