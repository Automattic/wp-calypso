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
import SelectDropdown from 'calypso/components/select-dropdown';

export const radioTextOption = (
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

export const radioSelectOption = (
	key,
	radioValue,
	onRadioChange,
	onSelectChange,
	radioPrompt,
	selectLabel,
	selectOptions,
	selected
) => {
	const selectInputKey = `${ key }Select`;

	const selectInput = selectOptions?.length && (
		<FormLabel key={ selectInputKey } className="cancel-purchase-form__reason-select">
			{ selectLabel }
			<SelectDropdown
				initialSelected={ selected }
				options={ selectOptions }
				onSelect={ onSelectChange }
				compact
			/>
		</FormLabel>
	);

	return (
		<React.Fragment key={ `fragment${ key }` }>
			<FormLabel key={ key }>
				<FormRadio
					name={ key }
					value={ key }
					checked={ key === radioValue }
					onChange={ onRadioChange }
					label={ radioPrompt }
				/>
			</FormLabel>
			{ key === radioValue && selectInput }
		</React.Fragment>
	);
};
