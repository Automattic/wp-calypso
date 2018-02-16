/** @format */
/**
 * External dependencies
 */
import React from 'react';

const TranslatableField = ( { originalString, title, fieldName, onChange, value, disabled } ) => (
	<label className="community-translator__string-container" htmlFor={ fieldName }>
		<span className="community-translator__string-description">{ title }</span>
		<span>
			<dfn>{ originalString }</dfn>
			<textarea
				id={ fieldName }
				name={ fieldName }
				value={ value }
				disabled={ disabled }
				onChange={ onChange }
			/>
		</span>
	</label>
);
export default TranslatableField;
