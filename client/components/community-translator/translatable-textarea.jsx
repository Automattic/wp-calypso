/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextarea from 'components/forms/form-textarea';

const TranslatableTextarea = ( {
	originalString,
	title,
	fieldName,
	onChange,
	value,
	disabled,
} ) => (
	<label className="community-translator__string-container" htmlFor={ fieldName }>
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
	</label>
);
export default TranslatableTextarea;
