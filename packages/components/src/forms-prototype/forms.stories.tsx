import {
	Button,
	CheckboxControl,
	Icon,
	/* eslint-disable wpcalypso/no-unsafe-wp-apis */
	__experimentalInputControl as InputControl,
	__experimentalNumberControl as NumberControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	/* eslint-enable wpcalypso/no-unsafe-wp-apis */
	SelectControl,
	ToggleControl,
	TextareaControl,
	TextControl,
	CustomSelectControl,
	ComboboxControl,
	RadioControl,
	RangeControl,
} from '@wordpress/components';
import { caution } from '@wordpress/icons';
import { cloneElement, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import './style.scss';

const meta: Meta = {
	title: 'Prototypes/Forms',
};
export default meta;

function ControlWithError< C extends React.ReactElement >( {
	onReportCustomValidity,
	render,
	...props
}: {
	onReportCustomValidity?: ( value: string ) => string | void;
	render: C;
} ) {
	const [ errorMessage, setErrorMessage ] = useState< string | undefined >();
	const ref = useRef< HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement >( null );

	const validate = () => {
		if ( ! ref.current ) {
			return;
		}

		const message = onReportCustomValidity?.( ref.current.value );
		ref.current.setCustomValidity?.( message ?? '' );

		setErrorMessage( ref.current.validationMessage );
	};

	const onBlur = ( ...args ) => {
		validate();

		// Workaround for setCustomValidity() forcing an immediate re-render,
		// which can reset the field value in uncontrolled mode.
		const previousValue = ref.current?.value;
		setTimeout( () => {
			if ( ref.current ) {
				ref.current.value = previousValue ?? '';
			}
		}, 0 );

		render.props.onBlur?.( ...args );
	};

	const onChange = ( ...args ) => {
		// Only validate incrementally if the value is already marked as invalid.
		if ( ! ref.current?.validity?.valid ) {
			validate();
		}

		render.props.onChange?.( ...args );
	};

	const label = render.props.required ? (
		<>
			{ render.props.label } <span aria-hidden="true">(Required)</span>
		</>
	) : (
		render.props.label
	);

	return (
		<div className="a8c-use-validation">
			{ cloneElement( render, {
				...props,
				label,
				onBlur,
				onChange,
				ref,
			} ) }
			{ errorMessage && (
				<p className="a8c-use-validation__error">
					<Icon icon={ caution } size={ 16 } fill="currentColor" />
					{ errorMessage }
				</p>
			) }
		</div>
	);
}

export const Default: StoryObj = {
	render: function Template() {
		const [ toggleControlChecked, setToggleControlChecked ] = useState( false );
		const [ checkboxControlChecked, setCheckboxControlChecked ] = useState( false );
		const [ radioControlChecked, setRadioControlChecked ] = useState< string | undefined >();

		return (
			<form
				style={ {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					gap: 16,
				} }
			>
				<div
					style={ {
						display: 'flex',
						flexDirection: 'column',
						gap: 16,
						alignItems: 'stretch',
						width: 300,
					} }
				>
					<ControlWithError
						render={
							<InputControl
								__next40pxDefaultSize
								required
								label="Input"
								help="The word 'error' will trigger an error."
							/>
						}
						onReportCustomValidity={ ( value ) => {
							if ( value.toLowerCase() === 'error' ) {
								return 'The word "error" is not allowed.';
							}
						} }
					/>
					<ControlWithError
						render={
							<NumberControl
								__next40pxDefaultSize
								label="Number"
								help="Odd numbers are not allowed."
							/>
						}
						onReportCustomValidity={ ( value ) => {
							if ( value && parseInt( value, 10 ) % 2 !== 0 ) {
								return 'Choose an even number.';
							}
						} }
					/>
					<ControlWithError
						render={
							// TODO: Use of `required` renders an invalid label in HTML.
							<ToggleGroupControl
								__nextHasNoMarginBottom
								label="Toggle Group"
								isBlock
								__next40pxDefaultSize
								required
								value="1"
							>
								<ToggleGroupControlOption value="1" label="Option 1" />
								<ToggleGroupControlOption value="2" label="Option 2" />
							</ToggleGroupControl>
						}
						// TODO: Needs custom handling
						onReportCustomValidity={ ( value ) => {
							if ( value === '1' ) {
								return 'Option 1 is not allowed.';
							}
						} }
					/>
					<ControlWithError
						render={
							// TODO: Rest props are not passed down.
							<ToggleControl
								required
								__nextHasNoMarginBottom
								label="Toggle"
								checked={ toggleControlChecked }
								onChange={ setToggleControlChecked }
							/>
						}
						onReportCustomValidity={ ( value ) => {
							if ( value ) {
								return 'Checkbox is not allowed.';
							}
						} }
					/>
					<ControlWithError
						render={
							<CheckboxControl
								__nextHasNoMarginBottom
								required
								label="Checkbox"
								checked={ checkboxControlChecked }
								onChange={ setCheckboxControlChecked }
							/>
						}
						// TODO: Ref is not forwarded.
						onReportCustomValidity={ ( value ) => {
							if ( value ) {
								return 'Checkbox is not allowed.';
							}
						} }
					/>
					<ControlWithError
						render={
							<SelectControl
								required
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								label="Select"
								help="Option 1 is not allowed."
								options={ [
									{ value: '', label: 'Select an option' },
									{ value: '1', label: 'Option 1 (not allowed)' },
									{ value: '2', label: 'Option 2' },
								] }
							/>
						}
						onReportCustomValidity={ ( value ) => {
							if ( value === '1' ) {
								return 'Option 1 is not allowed.';
							}
						} }
					/>
					<ControlWithError
						render={
							<CustomSelectControl
								// TODO: Required isn't passed down correctly.
								required
								__next40pxDefaultSize
								label="Custom Select"
								options={ [
									{ key: '', name: 'Select an option' },
									{ key: 'a', name: 'Option A (not allowed)' },
									{ key: 'b', name: 'Option B' },
								] }
							/>
						}
						// TODO: Ref is not forwarded.
						onReportCustomValidity={ ( value ) => {
							if ( value === 'a' ) {
								return 'Option A is not allowed.';
							}
						} }
					/>
					<ControlWithError
						render={
							<ComboboxControl
								__nextHasNoMarginBottom
								__next40pxDefaultSize
								// TODO: Rest props are not passed down.
								required
								label="Combobox"
								help="Option A is not allowed."
								options={ [
									{ value: 'a', label: 'Option A (not allowed)' },
									{ value: 'b', label: 'Option B' },
								] }
							/>
						}
						// TODO: onBlur is not passed down.
						onReportCustomValidity={ ( value ) => {
							if ( value === 'a' ) {
								return 'Option A is not allowed.';
							}
						} }
					/>
					<ControlWithError
						render={
							<RadioControl
								label="Radio"
								required
								help="Option A is not allowed"
								selected={ radioControlChecked }
								onChange={ setRadioControlChecked }
								options={ [
									{ label: 'Option A', value: 'a' },
									{ label: 'Option B (not allowed)', value: 'b' },
								] }
							/>
						}
						// TODO: Ref is not forwarded.
						onReportCustomValidity={ ( value ) => {
							if ( value === 'b' ) {
								return 'Option B is not allowed.';
							}
						} }
					/>
					<ControlWithError
						render={
							<RangeControl
								// TODO: Use of `required` renders an invalid label in HTML.
								required
								label="Range"
								help="Odd numbers are not allowed."
								min={ 0 }
								max={ 20 }
							/>
						}
						onReportCustomValidity={ ( value ) => {
							if ( value && parseInt( value, 10 ) % 2 !== 0 ) {
								return 'Choose an even number.';
							}
						} }
					/>
					<ControlWithError
						render={
							<TextControl __next40pxDefaultSize __nextHasNoMarginBottom label="Text" required />
						}
						onReportCustomValidity={ ( value ) => {
							if ( value.toLowerCase() === 'error' ) {
								return 'The word "error" is not allowed.';
							}
						} }
					/>
					<ControlWithError
						render={
							<TextareaControl
								__nextHasNoMarginBottom
								label="Textarea"
								required
								help="The word 'error' will trigger an error."
							/>
						}
						onReportCustomValidity={ ( value ) => {
							if ( value.toLowerCase() === 'error' ) {
								return 'The word "error" is not allowed.';
							}
						} }
					/>
				</div>

				<Button variant="primary" type="submit" __next40pxDefaultSize>
					Submit
				</Button>
			</form>
		);
	},
};
