import { fn } from '@storybook/test';
import {
	Button,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
} from '@wordpress/components';
import { seen, unseen } from '@wordpress/icons';
import { useState } from 'react';
import { ValidatedInputControl } from './input-control';
import { formDecorator } from './story-utils';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof ValidatedInputControl > = {
	title: 'Validated Form Controls/ValidatedInputControl',
	component: ValidatedInputControl,
	decorators: formDecorator,
	args: { onChange: fn() },
	argTypes: {
		__unstableInputWidth: { control: { type: 'text' } },
		__unstableStateReducer: { control: false },
		onChange: { control: false },
		prefix: { control: false },
		suffix: { control: false },
		type: { control: { type: 'text' } },
		value: { control: false },
	},
};
export default meta;

export const Default: StoryObj< typeof ValidatedInputControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedInputControl >[ 'value' ] >( '' );

		return (
			<ValidatedInputControl
				{ ...args }
				value={ value }
				onChange={ ( newValue, ...rest ) => {
					setValue( newValue );
					onChange?.( newValue, ...rest );
				} }
			/>
		);
	},
};
Default.args = {
	required: true,
	label: 'Input',
	help: 'The word "error" will trigger an error.',
	customValidator: ( value ) => {
		if ( value?.toLowerCase() === 'error' ) {
			return 'The word "error" is not allowed.';
		}
	},
};

/**
 * This demonstrates how password validation would work with the standard implementation.
 *
 * We are planning to move to a custom implementation more tailored to the password use case.
 */
export const Password: StoryObj< typeof ValidatedInputControl > = {
	render: function Template( { onChange, ...args } ) {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedInputControl >[ 'value' ] >( '' );
		const [ visible, setVisible ] = useState( false );

		return (
			<ValidatedInputControl
				{ ...args }
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
				value={ value }
				onChange={ ( newValue, ...rest ) => {
					setValue( newValue );
					onChange?.( newValue, ...rest );
				} }
			/>
		);
	},
};
Password.args = {
	required: true,
	label: 'Password',
	help: 'Minimum 8 characters, include a number, capital letter, and symbol (!@£$%^&*#).',
	minLength: 8,
	customValidator: ( value ) => {
		if ( ! /\d/.test( value ?? '' ) ) {
			return 'Password must include at least one number.';
		}
		if ( ! /[A-Z]/.test( value ?? '' ) ) {
			return 'Password must include at least one capital letter.';
		}
		if ( ! /[!@£$%^&*#]/.test( value ?? '' ) ) {
			return 'Password must include at least one symbol.';
		}
	},
};
Password.argTypes = {
	suffix: { control: false },
	type: { control: false },
};
