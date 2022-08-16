/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import Composer from '../composer';

const noop = () => {};

describe( '<Composer />', () => {
	describe( 'onChange event', () => {
		test( 'should call onSetCurrentMessage property and send a typing event if message is not empty', async () => {
			const user = userEvent.setup();
			const onSendNotTyping = jest.fn();
			const onSendTyping = jest.fn();
			const onSetCurrentMessage = jest.fn();
			render(
				<Composer
					message={ 'hey' }
					onSetCurrentMessage={ onSetCurrentMessage }
					onSendTyping={ onSendTyping }
					onSendNotTyping={ onSendNotTyping }
					translate={ noop }
				/>
			);
			const el = screen.getByRole( 'textbox', { name: /support request/i } );
			await user.type( el, 'hey' );
			expect( onSetCurrentMessage ).toHaveBeenCalled();
			expect( onSendTyping ).toHaveBeenCalled();
			expect( onSendNotTyping ).not.toHaveBeenCalled();
		} );

		test( 'should call onSetCurrentMessage property and send a noTyping event if message is empty', async () => {
			const user = userEvent.setup();
			const onSendNotTyping = jest.fn();
			const onSendTyping = jest.fn();
			const onSetCurrentMessage = jest.fn();
			const WrappedWithMessageState = ( props ) => {
				const [ message, setMessage ] = useState( 'x' );
				props.onSetCurrentMessage.mockImplementation( ( value ) => setMessage( value ) );
				return <Composer { ...props } message={ message } />;
			};
			render(
				<WrappedWithMessageState
					onSetCurrentMessage={ onSetCurrentMessage }
					onSendTyping={ onSendTyping }
					onSendNotTyping={ onSendNotTyping }
					translate={ noop }
				/>
			);
			const el = screen.getByRole( 'textbox', { name: /support request/i } );
			await user.click( el );
			await user.keyboard( '{Backspace}' );
			expect( onSetCurrentMessage ).toHaveBeenCalled();
			expect( onSendTyping ).not.toHaveBeenCalled();
			expect( onSendNotTyping ).toHaveBeenCalled();
		} );
	} );

	describe( 'onKeyDown event', () => {
		test( 'should call message and noTyping props if message is not empty', async () => {
			const user = userEvent.setup();
			const onSendMessage = jest.fn();
			const onSendNotTyping = jest.fn();
			render(
				<Composer
					message={ 'hey' }
					onSendMessage={ onSendMessage }
					onSendNotTyping={ onSendNotTyping }
					translate={ noop }
				/>
			);
			const btn = screen.getByRole( 'button' );
			await user.click( btn );
			expect( onSendMessage ).toHaveBeenCalled();
			expect( onSendNotTyping ).toHaveBeenCalled();
		} );

		test( 'should call message and noTyping props if message is empty', async () => {
			const user = userEvent.setup();
			const onSendMessage = jest.fn();
			const onSendNotTyping = jest.fn();
			render(
				<Composer
					message={ '' }
					onSetCurrentMessage={ ( ...args ) => console.log( args ) }
					onSendMessage={ onSendMessage }
					onSendNotTyping={ onSendNotTyping }
					translate={ noop }
				/>
			);
			const btn = screen.getByRole( 'button' );
			await user.click( btn );
			expect( onSendMessage ).not.toHaveBeenCalled();
			expect( onSendNotTyping ).not.toHaveBeenCalled();
		} );
	} );
} );
