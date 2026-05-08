/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ComposerTextarea } from '../composer-textarea';

describe( '<ComposerTextarea>', () => {
	it( 'auto-focuses on mount', () => {
		render(
			<ComposerTextarea
				value=""
				onChange={ () => {} }
				onSubmit={ () => {} }
				placeholder="Replying"
			/>
		);
		expect( screen.getByRole( 'textbox' ) ).toHaveFocus();
	} );

	it( 'calls onChange with the typed value', async () => {
		const user = userEvent.setup();

		function Wrapper() {
			const [ v, setV ] = useState( '' );
			return (
				<ComposerTextarea value={ v } onChange={ setV } onSubmit={ () => {} } placeholder="x" />
			);
		}

		render( <Wrapper /> );
		await user.type( screen.getByRole( 'textbox' ), 'hi' );
		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'hi' );
	} );

	it( 'submits on Cmd+Enter', async () => {
		const onSubmit = jest.fn();
		const user = userEvent.setup();
		render(
			<ComposerTextarea value="ready" onChange={ () => {} } onSubmit={ onSubmit } placeholder="x" />
		);
		await user.type( screen.getByRole( 'textbox' ), '{Meta>}{Enter}{/Meta}' );
		expect( onSubmit ).toHaveBeenCalled();
	} );

	it( 'does not submit on plain Enter', async () => {
		const onSubmit = jest.fn();
		const user = userEvent.setup();
		render(
			<ComposerTextarea value="ready" onChange={ () => {} } onSubmit={ onSubmit } placeholder="x" />
		);
		await user.type( screen.getByRole( 'textbox' ), '{Enter}' );
		expect( onSubmit ).not.toHaveBeenCalled();
	} );
} );
