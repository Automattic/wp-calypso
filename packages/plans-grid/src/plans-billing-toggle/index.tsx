/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Internal dependencies
 */

/**
 * Style dependencies
 */
import './style.scss';

type ToggleOption = {
	label: string;
	value: string;
};

type ToggleItemProps = {
	option: ToggleOption;
	defaultChecked: boolean;
	onChange: ( selectedValue: string ) => void;
};

type ToggleHostProps = {
	options: ToggleOption[];
	onChange: ( selectedValue: string ) => void;
	defaultOptionIndex: number;
};

const INPUT_NAME = 'plant-billing-toggle';

const PlansToggleItem: React.FunctionComponent< ToggleItemProps > = ( {
	option,
	defaultChecked,
	onChange,
} ) => {
	const inputId = `toggle-item-${ option.value }`;
	return (
		<>
			<input
				className="plans-billing-toggle__input"
				type="radio"
				id={ inputId }
				name={ INPUT_NAME }
				value={ option.value }
				defaultChecked={ defaultChecked }
				onChange={ ( e ) => onChange( e.target.value ) }
			/>
			<label className="plans-billing-toggle__label" htmlFor={ inputId }>
				{ option.label }
			</label>
		</>
	);
};

const PlansBillingToggle: React.FunctionComponent< ToggleHostProps > = ( {
	options,
	onChange,
	defaultOptionIndex = 0,
} ) => {
	// Make sure that the selected option's index is always within range
	const selectedOptionIndex = Math.min( options.length - 1, Math.max( 0, defaultOptionIndex ) );

	return options.length > 0 ? (
		<fieldset className="plans-billing-toggle">
			<legend className="plans-billing-toggle__legend">TODO: title</legend>
			<div className="plans-billing-toggle__wrapper">
				{ options.map( ( option, index ) => (
					<PlansToggleItem
						key={ option.value }
						option={ option }
						defaultChecked={ index === selectedOptionIndex }
						onChange={ onChange }
					/>
				) ) }
			</div>
		</fieldset>
	) : null;
};

export default PlansBillingToggle;
