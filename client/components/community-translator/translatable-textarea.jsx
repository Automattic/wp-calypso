/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import FormTextarea from 'calypso/components/forms/form-textarea';

const TranslatableTextarea = ( {
	originalString,
	title,
	fieldName,
	onChange,
	value,
	disabled,
} ) => (
	<FormLabel className="community-translator__string-container" htmlFor={ fieldName }>
		<span className="community-translator__string-description">{ title }</span>
		<span>
			<dfn>{ originalString }</dfn>
			<FormTextarea
				id={ fieldName }
				name={ fieldName }
				value={ value }
				disabled={ disabled }
				onChange={ onChange }
			/>
		</span>
	</FormLabel>
);
export default TranslatableTextarea;
