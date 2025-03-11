import {
	Button,
	CheckboxControl,
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
import { useState } from 'react';
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

export const Default: StoryObj = {
	render: function Template() {
		const [ toggleControlChecked, setToggleControlChecked ] = useState( false );
		const [ checkboxControlChecked, setCheckboxControlChecked ] = useState( false );
		const [ radioControlChecked, setRadioControlChecked ] = useState< string | undefined >();

		return (
			<>
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
			</>
		);
	},
};

export const Password: StoryObj = {
	render: () => {
		return (
			<ControlWithError
				render={
					<InputControl
						__next40pxDefaultSize
						label="Password"
						help="Minimum 8 characters, include a number, capital letter, and symbol (!@£$%^&*#)."
						minLength={ 8 }
						required
					/>
				}
				onReportCustomValidity={ ( value ) => {
					if ( ! /\d/.test( value ) ) {
						return 'Password must include at least one number.';
					}
					if ( ! /[A-Z]/.test( value ) ) {
						return 'Password must include at least one capital letter.';
					}
					if ( ! /[!@£$%^&*#]/.test( value ) ) {
						return 'Password must include at least one symbol.';
					}
				} }
			/>
		);
	},
};

export const ToggleGroup: StoryObj = {
	render: () => (
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
	),
};
