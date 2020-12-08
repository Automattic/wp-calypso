/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal Dependencies
 */

import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormTextInput from 'calypso/components/forms/form-text-input';

export const radioOption = (
	key,
	radioValue,
	textValue,
	onRadioChange,
	onTextChange,
	radioPrompt,
	textPlaceholder
) => {
	const textInputKey = `${ key }Input`;

	const textInput = textPlaceholder && (
		<FormTextInput
			className="cancel-purchase-form__reason-input"
			name={ textInputKey }
			id={ textInputKey }
			value={ textValue }
			onChange={ onTextChange }
			placeholder={ textPlaceholder }
		/>
	);
	return (
		<FormLabel key={ key }>
			<FormRadio
				name={ key }
				value={ key }
				checked={ key === radioValue }
				onChange={ onRadioChange }
				label={ radioPrompt }
			/>
			{ key === radioValue && textInput }
		</FormLabel>
	);
};
