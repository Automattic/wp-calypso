/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { Button } from '@wordpress/components';

const DomainPickerSuggestionItemPlaceholder: FunctionComponent = () => {
	return (
		<Button className="domain-picker__suggestion-item" isTertiary>
			<div className="domain-picker__suggestion-item-name placeholder"></div>
			<div className="domain-picker__price placeholder"></div>
		</Button>
	);
};

export default DomainPickerSuggestionItemPlaceholder;
