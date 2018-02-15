/** @format */
/**
 * External dependencies
 */
import React from 'react';

const TranslatableField = ( { originalString, title, fieldName, onChange, value } ) => (
	<label className="community-translator__string-container" htmlFor={ fieldName }>
		<span className="community-translator__string-description">{ title }</span>
		<span>
			<dfn>{ originalString }</dfn>
			<textarea
				id={ fieldName }
				name={ fieldName }
				value={ value }
				onChange={ onChange }
			/>
		</span>
	</label>
);
export default TranslatableField;
