import {
	Button,
	CheckboxControl,
	/* eslint-disable wpcalypso/no-unsafe-wp-apis */
	__experimentalInputControl as InputControl,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
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
import { seen, unseen } from '@wordpress/icons';
import React, { useEffect, useRef, useState } from 'react';
import { ControlWithError } from './control-with-error';
import type { Meta, StoryObj } from '@storybook/react';

import './style.scss';

const meta: Meta = {
	title: 'Prototypes/Forms',
	decorators: [
		( Story ) => (
			<form
				style={ {
					fontFamily: 'sans-serif',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					gap: 16,
				} }
				onSubmit={ ( e ) => {
					// TODO: Add example for how to check all custom validity on submit.
					e.preventDefault();
					alert( 'Form submitted!' );
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
					<Story />
				</div>

				<Button variant="primary" type="submit" __next40pxDefaultSize>
					Submit
				</Button>
			</form>
		),
	],
};
export default meta;

export const Input: StoryObj = {
	name: 'InputControl',
	render: function Template() {
		const valueRef = useRef< string >( '' );
		const validityTargetRef = useRef< HTMLInputElement >( null );

		return (
			<ControlWithError
				render={
					<InputControl
						__next40pxDefaultSize
						label="Input"
						help="The word 'error' will trigger an error."
						onChange={ ( value ) => {
							valueRef.current = value ?? '';
						} }
						required
						ref={ validityTargetRef }
					/>
				}
				onReportCustomValidity={ () => {
					if ( valueRef.current.toLowerCase() === 'error' ) {
						return 'The word "error" is not allowed.';
					}
				} }
				getValidityTarget={ () => validityTargetRef.current }
			/>
		);
	},
};

// TODO: Value can be wiped out on blur.
export const Password: StoryObj = {
	name: 'InputControl (Password)',
	render: function Template() {
		const valueRef = useRef< string >( '' );
		const validityTargetRef = useRef< HTMLInputElement >( null );
		const [ visible, setVisible ] = useState( false );
		return (
			<ControlWithError
				render={
					<InputControl
						type={ visible ? 'text' : 'password' }
						suffix={
							<InputControlSuffixWrapper variant="control">
								<Button
									size="small"
									icon={ visible ? unseen : seen }
									onClick={ () => setVisible( ( value ) => ! value ) }
									label={ visible ? 'Hide password' : 'Show password' }
								/>
							</InputControlSuffixWrapper>
						}
						__next40pxDefaultSize
						label="Password"
						help="Minimum 8 characters, include a number, capital letter, and symbol (!@£$%^&*#)."
						minLength={ 8 }
						onChange={ ( value ) => {
							valueRef.current = value ?? '';
						} }
						required
						ref={ validityTargetRef }
					/>
				}
				onReportCustomValidity={ () => {
					if ( ! /\d/.test( valueRef.current ) ) {
						return 'Password must include at least one number.';
					}
					if ( ! /[A-Z]/.test( valueRef.current ) ) {
						return 'Password must include at least one capital letter.';
					}
					if ( ! /[!@£$%^&*#]/.test( valueRef.current ) ) {
						return 'Password must include at least one symbol.';
					}
				} }
				getValidityTarget={ () => validityTargetRef.current }
			/>
		);
	},
};

export const Text: StoryObj = {
	name: 'TextControl',
	render: function Template() {
		const [ value, setValue ] = useState< string >( '' );
		const valueRef = useRef< string >( '' );
		const validityTargetRef = useRef< HTMLInputElement >( null );

		return (
			<ControlWithError
				render={
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label="Text"
						required
						value={ value }
						onChange={ ( value ) => {
							setValue( value );
							valueRef.current = value;
						} }
						help="The word 'error' will trigger an error."
						ref={ validityTargetRef }
					/>
				}
				onReportCustomValidity={ () => {
					if ( valueRef.current.toLowerCase() === 'error' ) {
						return 'The word "error" is not allowed.';
					}
				} }
				getValidityTarget={ () => validityTargetRef.current }
			/>
		);
	},
};

export const Textarea: StoryObj = {
	render: function Template() {
		const [ value, setValue ] = useState< string >( '' );
		const valueRef = useRef< string >( '' );
		const validityTargetRef = useRef< HTMLTextAreaElement >( null );

		return (
			<ControlWithError
				render={
					<TextareaControl
						__nextHasNoMarginBottom
						label="Textarea"
						required
						help="The word 'error' will trigger an error."
						value={ value }
						onChange={ ( value ) => {
							setValue( value );
							valueRef.current = value;
						} }
						ref={ validityTargetRef }
					/>
				}
				onReportCustomValidity={ () => {
					if ( valueRef.current.toLowerCase() === 'error' ) {
						return 'The word "error" is not allowed.';
					}
				} }
				getValidityTarget={ () => validityTargetRef.current }
			/>
		);
	},
};

export const Number: StoryObj = {
	render: function Template() {
		const valueRef = useRef< string >( '' );
		const validityTargetRef = useRef< HTMLInputElement >( null );

		return (
			<ControlWithError
				render={
					<NumberControl
						__next40pxDefaultSize
						label="Number"
						help="Odd numbers are not allowed."
						// TODO: Upstream limitation - When form is submitted when value is undefined, it will
						// automatically set a clamped value (as defined by `min` attribute, so 0 by default).
						onChange={ ( value ) => {
							valueRef.current = value ?? '';
						} }
						required
						ref={ validityTargetRef }
					/>
				}
				onReportCustomValidity={ () => {
					if ( valueRef.current && parseInt( valueRef.current, 10 ) % 2 !== 0 ) {
						return 'Choose an even number.';
					}
				} }
				getValidityTarget={ () => validityTargetRef.current }
			/>
		);
	},
};

export const Checkbox: StoryObj = {
	render: function Template() {
		const [ checkboxControlChecked, setCheckboxControlChecked ] = useState( false );
		const valueRef = useRef< boolean >();
		const validityTargetRef = useRef< HTMLInputElement >( null );

		return (
			<ControlWithError
				render={
					<CheckboxControl
						__nextHasNoMarginBottom
						required
						label="Checkbox"
						// TODO: Upstream limitation - CheckboxControl doesn't support uncontrolled mode, visually.
						checked={ checkboxControlChecked }
						onChange={ ( value ) => {
							setCheckboxControlChecked( value );
							valueRef.current = value;
						} }
						help="This checkbox may neither be checked nor unchecked."
					/>
				}
				ref={ validityTargetRef }
				onReportCustomValidity={ () => {
					if ( valueRef.current ) {
						return 'This checkbox may not be checked.';
					}
				} }
				getValidityTarget={ () =>
					validityTargetRef.current?.querySelector( 'input[type="checkbox"]' )
				}
			/>
		);
	},
};

export const Toggle: StoryObj = {
	render: function Template() {
		const [ checked, setChecked ] = useState( false );
		const valueRef = useRef< boolean >();
		const validityTargetRef = useRef< HTMLInputElement >( null );

		// TODO: Upstream limitation - The `required` attribute is not passed down to the input,
		// so we need to set it manually.
		useEffect( () => {
			const required = true; // TODO: Make this changeable by the consumer.

			if ( validityTargetRef.current ) {
				validityTargetRef.current.required = required;
			}
		}, [] );

		// TODO: Should we customize the default `missingValue` message? It says to "check this box".
		return (
			<ControlWithError
				render={
					<ToggleControl
						__nextHasNoMarginBottom
						label="Toggle"
						// TODO: Upstream limitation - FormToggle (and thus ToggleControl) doesn't support uncontrolled mode, visually.
						checked={ checked }
						onChange={ ( value ) => {
							setChecked( value );
							valueRef.current = value;
						} }
						required
						ref={ validityTargetRef }
						help="This toggle may neither be enabled nor disabled."
					/>
				}
				onReportCustomValidity={ () => {
					if ( valueRef.current ) {
						return 'This toggle may not be enabled.';
					}
				} }
				getValidityTarget={ () => validityTargetRef.current }
			/>
		);
	},
};

export const Radio: StoryObj = {
	render: function Template() {
		const [ radioControlChecked, setRadioControlChecked ] =
			useState< React.ComponentProps< typeof RadioControl >[ 'selected' ] >();
		const ref = useRef< HTMLDivElement >( null );
		const valueRef = useRef< React.ComponentProps< typeof RadioControl >[ 'selected' ] >();

		return (
			<ControlWithError
				render={
					<RadioControl
						label="Radio"
						required
						help="Option B is not allowed."
						selected={ radioControlChecked }
						onChange={ ( value ) => {
							valueRef.current = value;
							setRadioControlChecked( value );
						} }
						options={ [
							{ label: 'Option A', value: 'a' },
							{ label: 'Option B (not allowed)', value: 'b' },
						] }
					/>
				}
				ref={ ref }
				onReportCustomValidity={ () => {
					if ( valueRef.current === 'b' ) {
						return 'Option B is not allowed.';
					}
				} }
				getValidityTarget={ () => ref.current?.querySelector( 'input[type="radio"]' ) }
			/>
		);
	},
};

export const Select: StoryObj = {
	render: function Template() {
		const valueRef = useRef< string >();
		const validityTargetRef = useRef< HTMLSelectElement >( null );

		return (
			<ControlWithError
				render={
					<SelectControl
						required
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label="Select"
						help="Selecting option 1 will trigger an error."
						options={ [
							{ value: '', label: 'Select an option' },
							{ value: '1', label: 'Option 1 (not allowed)' },
							{ value: '2', label: 'Option 2' },
						] }
						onChange={ ( value ) => {
							valueRef.current = value;
						} }
						ref={ validityTargetRef }
					/>
				}
				onReportCustomValidity={ () => {
					if ( valueRef.current === '1' ) {
						return 'Option 1 is not allowed.';
					}
				} }
				getValidityTarget={ () => validityTargetRef.current }
			/>
		);
	},
};

export const CustomSelect: StoryObj = {
	render: function Template() {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof CustomSelectControl >[ 'value' ] >();
		const valueRef = useRef< React.ComponentProps< typeof CustomSelectControl >[ 'value' ] >();
		const validityTargetRef = useRef< HTMLSelectElement >( null );

		return (
			<div className="a8c-use-validation__wrapper-with-error-delegate">
				<ControlWithError
					render={
						<CustomSelectControl
							// TODO: Upstream limitation - Required isn't passed down correctly.
							// Needs to be set on delegate element.
							required
							__next40pxDefaultSize
							label="Custom Select"
							options={ [
								{ key: '', name: 'Select an option' },
								{ key: 'a', name: 'Option A (not allowed)' },
								{ key: 'b', name: 'Option B' },
							] }
							value={ value }
							onChange={ ( value ) => {
								setValue( value );
								valueRef.current = value;
							} }
						/>
					}
					onReportCustomValidity={ () => {
						if ( valueRef.current?.selectedItem.key === 'a' ) {
							return 'Option A is not allowed.';
						}
					} }
					getValidityTarget={ () => validityTargetRef.current }
				/>
				<select
					style={ {
						position: 'absolute',
						top: 0,
						height: '100%',
						width: '100%',
						opacity: 0,
						pointerEvents: 'none',
					} }
					ref={ validityTargetRef }
					required
					tabIndex={ -1 }
					// TODO: This doesn't prevent a missing value error once the control is touched.
					value={ value ? 'hasvalue' : '' }
					onChange={ () => {} } // Prevent React warning.
					onFocus={ ( e ) => {
						e.target.previousElementSibling
							?.querySelector< HTMLButtonElement >( '[role="combobox"]' )
							?.focus();
					} }
				>
					<option value="">No selection</option>
					<option value="hasvalue">Has selection</option>
				</select>
			</div>
		);
	},
};

export const ToggleGroup: StoryObj = {
	render: function Template() {
		const validityTargetRef = useRef< HTMLInputElement >( null );
		const valueRef = useRef< string | number | undefined >( '1' );

		return (
			<div className="a8c-use-validation__wrapper-with-error-delegate">
				<ControlWithError
					render={
						<ToggleGroupControl
							__nextHasNoMarginBottom
							label="Toggle Group"
							isBlock
							__next40pxDefaultSize
							required
							onChange={ ( value ) => {
								valueRef.current = value;
							} }
							help="Selecting option 2 will trigger an error."
							// TODO: Upstream limitation - In uncontrolled mode, starting from an undefined value then
							// setting a value has a visual bug.
							value="1"
						>
							<ToggleGroupControlOption value="1" label="Option 1" />
							<ToggleGroupControlOption value="2" label="Option 2" />
						</ToggleGroupControl>
					}
					onReportCustomValidity={ () => {
						if ( valueRef.current === '2' ) {
							return 'Option 2 is not allowed.';
						}
					} }
					getValidityTarget={ () => validityTargetRef.current }
				/>
				<input
					style={ {
						position: 'absolute',
						top: 0,
						height: '100%',
						width: '100%',
						opacity: 0,
						pointerEvents: 'none',
					} }
					type="radio"
					ref={ validityTargetRef }
					required
					checked={ valueRef.current != null }
					tabIndex={ -1 }
					// TODO: Make this unique.
					name="foo"
					onChange={ () => {} } // Prevent React warning.
					onFocus={ ( e ) => {
						e.target.previousElementSibling
							?.querySelector< HTMLButtonElement | HTMLInputElement >( '[role="radio"]' )
							?.focus();
					} }
				/>
			</div>
		);
	},
};

export const Combobox: StoryObj = {
	render: function Template() {
		const valueRef = useRef< React.ComponentProps< typeof ComboboxControl >[ 'value' ] >();
		const validityTargetRef = useRef< HTMLInputElement >( null );

		// TODO: Upstream limitation - The `required` attribute is not passed down to the input,
		// so we need to set it manually.
		useEffect( () => {
			const required = true; // TODO: Make this changeable by the consumer.
			const input =
				validityTargetRef.current?.querySelector< HTMLInputElement >( 'input[role="combobox"]' );

			if ( input ) {
				input.required = required;
			}
		}, [] );

		return (
			<>
				<ControlWithError
					render={
						<ComboboxControl
							__nextHasNoMarginBottom
							__next40pxDefaultSize
							required
							label="Combobox"
							help="Option A is not allowed."
							options={ [
								{ value: 'a', label: 'Option A (not allowed)' },
								{ value: 'b', label: 'Option B' },
							] }
							onChange={ ( value ) => {
								valueRef.current = value;
							} }
						/>
					}
					ref={ validityTargetRef }
					onReportCustomValidity={ () => {
						if ( valueRef.current === 'a' ) {
							return 'Option A is not allowed.';
						}
					} }
					getValidityTarget={ () =>
						validityTargetRef.current?.querySelector( 'input[role="combobox"]' )
					}
				/>
			</>
		);
	},
};

export const Range: StoryObj = {
	render: function Template() {
		const valueRef = useRef< number | undefined >();
		const validityTargetRef = useRef< HTMLInputElement >( null );
		return (
			<ControlWithError
				render={
					<RangeControl
						required
						label="Range"
						help="Odd numbers are not allowed."
						min={ 0 }
						max={ 20 }
						onChange={ ( value ) => {
							valueRef.current = value;
						} }
						ref={ validityTargetRef }
					/>
				}
				onReportCustomValidity={ () => {
					if ( valueRef.current && valueRef.current % 2 !== 0 ) {
						return 'Choose an even number.';
					}
				} }
				getValidityTarget={ () => validityTargetRef.current }
			/>
		);
	},
};
