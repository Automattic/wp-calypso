import {
	Button,
	/* eslint-disable wpcalypso/no-unsafe-wp-apis */
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	/* eslint-enable wpcalypso/no-unsafe-wp-apis */
} from '@wordpress/components';
import React, { useState } from 'react';
import { ValidatedComboboxControl } from './components/combobox-control';
import { ValidatedCustomSelectControl } from './components/custom-select-control';
import { ValidatedInputControl } from './components/input-control';
import { ValidatedNumberControl } from './components/number-control';
import { ValidatedRadioControl } from './components/radio-control';
import { ValidatedRangeControl } from './components/range-control';
import { ValidatedSelectControl } from './components/select-control';
import { ValidatedTextControl } from './components/text-control';
import { ValidatedTextareaControl } from './components/textarea-control';
import { ValidatedToggleControl } from './components/toggle-control';
import { ValidatedToggleGroupControl } from './components/toggle-group-control';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	title: 'Prototypes/Forms',
	component: ValidatedInputControl,
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

export const Text: StoryObj = {
	name: 'TextControl',
	render: function Template() {
		const [ value, setValue ] = useState( '' );

		return (
			<ValidatedTextControl
				required
				label="Text"
				value={ value }
				onChange={ setValue }
				help="The word 'error' will trigger an error."
				onReportCustomValidity={ ( value ) => {
					if ( value?.toString().toLowerCase() === 'error' ) {
						return 'The word "error" is not allowed.';
					}
				} }
			/>
		);
	},
};

export const Textarea: StoryObj = {
	render: function Template() {
		const [ value, setValue ] = useState( '' );

		return (
			<ValidatedTextareaControl
				required
				label="Textarea"
				help="The word 'error' will trigger an error."
				value={ value }
				onChange={ setValue }
				onReportCustomValidity={ ( value ) => {
					if ( value?.toLowerCase() === 'error' ) {
						return 'The word "error" is not allowed.';
					}
				} }
			/>
		);
	},
};

export const Number: StoryObj = {
	render: function Template() {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedNumberControl >[ 'value' ] >();

		return (
			<ValidatedNumberControl
				required
				label="Number"
				help="Odd numbers are not allowed."
				value={ value }
				onChange={ setValue }
				onReportCustomValidity={ ( value ) => {
					if ( value && parseInt( value.toString(), 10 ) % 2 !== 0 ) {
						return 'Choose an even number.';
					}
				} }
			/>
		);
	},
};

export const Toggle: StoryObj = {
	render: function Template() {
		const [ checked, setChecked ] = useState( false );

		return (
			<ValidatedToggleControl
				required
				label="Toggle"
				help="This toggle may neither be enabled nor disabled."
				checked={ checked }
				onChange={ setChecked }
				onReportCustomValidity={ ( value ) => {
					if ( value ) {
						return 'This toggle may not be enabled.';
					}
				} }
			/>
		);
	},
};

export const Radio: StoryObj = {
	render: function Template() {
		const [ selected, setSelected ] =
			useState< React.ComponentProps< typeof ValidatedRadioControl >[ 'selected' ] >();

		return (
			<ValidatedRadioControl
				required
				label="Radio"
				help="Option B is not allowed."
				selected={ selected }
				onChange={ setSelected }
				options={ [
					{ label: 'Option A', value: 'a' },
					{ label: 'Option B (not allowed)', value: 'b' },
				] }
				onReportCustomValidity={ ( value ) => {
					if ( value === 'b' ) {
						return 'Option B is not allowed.';
					}
				} }
			/>
		);
	},
};

export const Select: StoryObj = {
	render: function Template() {
		const [ value, setValue ] = useState( '' );

		return (
			<ValidatedSelectControl
				required
				label="Select"
				help="Selecting option 1 will trigger an error."
				options={ [
					{ value: '', label: 'Select an option' },
					{ value: '1', label: 'Option 1 (not allowed)' },
					{ value: '2', label: 'Option 2' },
				] }
				value={ value }
				onChange={ setValue }
				onReportCustomValidity={ ( value ) => {
					if ( value === '1' ) {
						return 'Option 1 is not allowed.';
					}
				} }
			/>
		);
	},
};

export const CustomSelect: StoryObj = {
	render: function Template() {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedCustomSelectControl >[ 'value' ] >();

		return (
			<ValidatedCustomSelectControl
				required
				label="Custom Select"
				options={ [
					{ key: '', name: 'Select an option' },
					{ key: 'a', name: 'Option A (not allowed)' },
					{ key: 'b', name: 'Option B' },
				] }
				value={ value }
				onChange={ ( newValue ) => setValue( newValue.selectedItem ) }
				onReportCustomValidity={ ( value ) => {
					if ( value?.key === 'a' ) {
						return 'Option A is not allowed.';
					}
				} }
			/>
		);
	},
};

export const ToggleGroup: StoryObj = {
	render: function Template() {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedToggleGroupControl >[ 'value' ] >( '1' );

		return (
			<ValidatedToggleGroupControl
				required
				label="Toggle Group"
				isBlock
				value={ value }
				onChange={ setValue }
				help="Selecting option 2 will trigger an error."
				onReportCustomValidity={ ( value ) => {
					if ( value === '2' ) {
						return 'Option 2 is not allowed.';
					}
				} }
			>
				<ToggleGroupControlOption value="1" label="Option 1" />
				<ToggleGroupControlOption value="2" label="Option 2" />
			</ValidatedToggleGroupControl>
		);
	},
};

export const Combobox: StoryObj = {
	render: function Template() {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedComboboxControl >[ 'value' ] >();

		return (
			<ValidatedComboboxControl
				required
				label="Combobox"
				help="Option A is not allowed."
				options={ [
					{ value: 'a', label: 'Option A (not allowed)' },
					{ value: 'b', label: 'Option B' },
				] }
				value={ value }
				onChange={ setValue }
				onReportCustomValidity={ ( value ) => {
					if ( value === 'a' ) {
						return 'Option A is not allowed.';
					}
				} }
			/>
		);
	},
};

export const Range: StoryObj = {
	render: function Template() {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedRangeControl >[ 'value' ] >();

		return (
			<ValidatedRangeControl
				required
				label="Range"
				help="Odd numbers are not allowed."
				min={ 0 }
				max={ 20 }
				value={ value }
				onChange={ setValue }
				onReportCustomValidity={ ( value ) => {
					if ( value && value % 2 !== 0 ) {
						return 'Choose an even number.';
					}
				} }
			/>
		);
	},
};
