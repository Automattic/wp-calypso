import {
	Button,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
} from '@wordpress/components';
import { seen, unseen } from '@wordpress/icons';
import { useState } from 'react';
import { ValidatedInputControl } from './input-control';
import { formDecorator } from './story-utils';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	title: 'Packages/Components/Validated Form Controls/ValidatedInputControl',
	component: ValidatedInputControl,
	decorators: formDecorator,
};
export default meta;

export const Default: StoryObj = {
	render: function Template( args ) {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedInputControl >[ 'value' ] >( '' );

		return (
			<ValidatedInputControl
				required
				label="Input"
				help="The word 'error' will trigger an error."
				value={ value }
				onChange={ setValue }
				onReportCustomValidity={ ( newValue ) => {
					if ( newValue?.toLowerCase() === 'error' ) {
						return 'The word "error" is not allowed.';
					}
				} }
				{ ...args }
			/>
		);
	},
};

/**
 * This demonstrates how password validation would work with the standard implementation.
 *
 * We are planning to move to a custom implementation more tailored to the password use case.
 */
export const Password: StoryObj = {
	render: function Template( args ) {
		const [ value, setValue ] =
			useState< React.ComponentProps< typeof ValidatedInputControl >[ 'value' ] >( '' );
		const [ visible, setVisible ] = useState( false );

		return (
			<ValidatedInputControl
				required
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
				label="Password"
				help="Minimum 8 characters, include a number, capital letter, and symbol (!@£$%^&*#)."
				minLength={ 8 }
				value={ value }
				onChange={ setValue }
				onReportCustomValidity={ ( value ) => {
					if ( ! /\d/.test( value ?? '' ) ) {
						return 'Password must include at least one number.';
					}
					if ( ! /[A-Z]/.test( value ?? '' ) ) {
						return 'Password must include at least one capital letter.';
					}
					if ( ! /[!@£$%^&*#]/.test( value ?? '' ) ) {
						return 'Password must include at least one symbol.';
					}
				} }
				{ ...args }
			/>
		);
	},
};
