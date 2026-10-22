/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { render } from '../../../../test-utils';
import SiteIntake from '../site-intake-form';

const review = jest.fn();
function Intake() {
	const [ value, setValue ] = useState( '' );
	return (
		<SiteIntake
			value={ value }
			onChange={ setValue }
			onReview={ review }
			onError={ jest.fn() }
			error=""
		/>
	);
}

beforeEach( () => review.mockClear() );

test( 'starts compact and reviews a single URL with Enter', async () => {
	render( <Intake /> );
	const input = screen.getByRole( 'textbox', { name: 'Site addresses' } );
	expect( input ).toHaveAttribute( 'rows', '1' );
	await userEvent.type( input, 'client.example.com{Enter}' );
	expect( review ).toHaveBeenCalledWith( 'client.example.com' );
	expect( input ).toHaveValue( 'client.example.com' );
} );

test.each( [ 'Meta', 'Control', 'Shift' ] )(
	'%s+Return adds a line at the caret without submitting',
	async ( modifier ) => {
		render( <Intake /> );
		const input = screen.getByRole( 'textbox', { name: 'Site addresses' } ) as HTMLTextAreaElement;
		await userEvent.type( input, 'first.example second.example' );
		input.setSelectionRange( 13, 14 );
		await userEvent.keyboard( `{${ modifier }>}{Enter}{/${ modifier }}` );
		expect( input ).toHaveValue( 'first.example\nsecond.example' );
		expect( input.selectionStart ).toBe( 14 );
		expect( input ).toHaveFocus();
		expect( review ).not.toHaveBeenCalled();
		await userEvent.click( screen.getByRole( 'button', { name: 'Review sites' } ) );
		expect( review ).toHaveBeenCalledWith( 'first.example\nsecond.example' );
	}
);

test( 'pasting a list keeps the same input focused and Enter continues the list', async () => {
	const user = userEvent.setup();
	render( <Intake /> );
	const input = screen.getByRole( 'textbox', { name: 'Site addresses' } );
	await user.click( input );
	await user.paste( 'first.example\nsecond.example' );
	expect( screen.getByRole( 'textbox', { name: 'Site addresses' } ) ).toBe( input );
	expect( input ).toHaveFocus();
	await user.keyboard( '{Enter}' );
	expect( input ).toHaveValue( 'first.example\nsecond.example\n' );
	expect( review ).not.toHaveBeenCalled();
	await user.click( screen.getByRole( 'button', { name: 'Review sites' } ) );
	expect( review ).toHaveBeenCalledWith( 'first.example\nsecond.example\n' );
} );
