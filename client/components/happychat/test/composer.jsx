/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { mount } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Composer } from '../composer';

describe( '<Composer />', () => {
	describe( 'onChange event ', () => {
		test( 'should call onSetCurrentMessage property and send a typing event if message is not empty', () => {
			const onSendNotTyping = jest.fn();
			const onSendTyping = jest.fn();
			const onSetCurrentMessage = jest.fn();
			const wrapper = mount(
				<Composer
					message={ 'hey' }
					onSetCurrentMessage={ onSetCurrentMessage }
					onSendTyping={ onSendTyping }
					onSendNotTyping={ onSendNotTyping }
					translate={ noop }
				/>
			);
			wrapper.find( 'textarea' ).simulate( 'change', { target: { value: 'hey' } } );
			expect( onSetCurrentMessage ).toHaveBeenCalled();
			expect( onSendTyping ).toHaveBeenCalled();
			expect( onSendNotTyping ).not.toHaveBeenCalled();
		} );

		test( 'should call onSetCurrentMessage property and send a noTyping event if message is empty', () => {
			const onSendNotTyping = jest.fn();
			const onSendTyping = jest.fn();
			const onSetCurrentMessage = jest.fn();
			const wrapper = mount(
				<Composer
					message={ '' }
					onSetCurrentMessage={ onSetCurrentMessage }
					onSendTyping={ onSendTyping }
					onSendNotTyping={ onSendNotTyping }
					translate={ noop }
				/>
			);
			wrapper.find( 'textarea' ).simulate( 'change', { target: { value: '' } } );
			expect( onSetCurrentMessage ).toHaveBeenCalled();
			expect( onSendTyping ).not.toHaveBeenCalled();
			expect( onSendNotTyping ).toHaveBeenCalled();
		} );
	} );

	describe( 'onKeyDown event ', () => {
		test( 'should call message and noTyping props if message is not empty', () => {
			const onSendMessage = jest.fn();
			const onSendNotTyping = jest.fn();
			const wrapper = mount(
				<Composer
					message={ 'hey' }
					onSendMessage={ onSendMessage }
					onSendNotTyping={ onSendNotTyping }
					translate={ noop }
				/>
			);
			wrapper.find( 'textarea' ).simulate( 'keydown', { which: 13, preventDefault: () => {} } );
			expect( onSendMessage ).toHaveBeenCalled();
			expect( onSendNotTyping ).toHaveBeenCalled();
		} );

		test( 'should call message and noTyping props if message is empty', () => {
			const onSendMessage = jest.fn();
			const onSendNotTyping = jest.fn();
			const wrapper = mount(
				<Composer
					message={ '' }
					onSendMessage={ onSendMessage }
					onSendNotTyping={ onSendNotTyping }
					translate={ noop }
				/>
			);
			wrapper.find( 'textarea' ).simulate( 'keydown', { which: 13, preventDefault: () => {} } );
			expect( onSendMessage ).not.toHaveBeenCalled();
			expect( onSendNotTyping ).not.toHaveBeenCalled();
		} );
	} );
} );
