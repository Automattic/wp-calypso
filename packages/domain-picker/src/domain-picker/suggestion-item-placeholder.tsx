/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import type { SUGGESTION_ITEM_TYPE } from './suggestion-item';

const DomainPickerSuggestionItemPlaceholder: FunctionComponent< {
	type: SUGGESTION_ITEM_TYPE;
} > = ( { type } ) => {
	return (
		<div className={ classnames( 'domain-picker__suggestion-item placeholder', `type-${ type }` ) }>
			<div className="domain-picker__suggestion-item-name placeholder" />
			<div className="domain-picker__price placeholder"></div>
		</div>
	);
};

export default DomainPickerSuggestionItemPlaceholder;
