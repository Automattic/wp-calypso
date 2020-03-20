/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@wordpress/components';

const DomainPickerSuggestionItemPlaceholder: FunctionComponent< Button.AnchorProps > = props => {
	return (
		<Button className="domain-picker__suggestion-item" isTertiary { ...props }>
			<div className="domain-picker__suggestion-item-name placeholder"></div>
			<div className="domain-picker__price placeholder"></div>
		</Button>
	);
};

export default DomainPickerSuggestionItemPlaceholder;
