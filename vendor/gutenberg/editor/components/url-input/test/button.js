/**
 * External dependencies
 */
import { shallow, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import UrlInputButton from '../button';

describe( 'UrlInputButton', () => {
	const clickEditLink = ( wrapper ) => wrapper.find( 'IconButton.components-toolbar__control' ).simulate( 'click' );

	it( 'should have a valid class name in the wrapper tag', () => {
		const wrapper = shallow( <UrlInputButton /> );
		expect( wrapper.hasClass( 'editor-url-input__button' ) ).toBe( true );
	} );
	it( 'should not have is-active class when url prop not defined', () => {
		const wrapper = shallow( <UrlInputButton /> );
		expect( wrapper.find( 'IconButton' ).hasClass( 'is-active' ) ).toBe( false );
	} );
	it( 'should have is-active class name if url prop defined', () => {
		const wrapper = shallow( <UrlInputButton url="https://example.com" /> );
		expect( wrapper.find( 'IconButton' ).hasClass( 'is-active' ) ).toBe( true );
	} );
	it( 'should have hidden form by default', () => {
		const wrapper = shallow( <UrlInputButton /> );
		expect( wrapper.find( 'form' ) ).toHaveLength( 0 );
		expect( wrapper.state().expanded ).toBe( false );
	} );
	it( 'should have visible form when Edit Link button clicked', () => {
		const wrapper = shallow( <UrlInputButton /> );
		clickEditLink( wrapper );
		expect( wrapper.find( 'form' ) ).toHaveLength( 1 );
		expect( wrapper.state().expanded ).toBe( true );
	} );
	it( 'should call onChange function once when value changes once', () => {
		const onChangeMock = jest.fn();
		const wrapper = shallow( <UrlInputButton onChange={ onChangeMock } /> );
		clickEditLink( wrapper );
		wrapper.find( '[data-test=\'UrlInput\']' ).simulate( 'change' );
		expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
	} );
	it( 'should call onChange function twice when value changes twice', () => {
		const onChangeMock = jest.fn();
		const wrapper = shallow( <UrlInputButton onChange={ onChangeMock } /> );
		clickEditLink( wrapper );
		wrapper.find( '[data-test=\'UrlInput\']' ).simulate( 'change' );
		wrapper.find( '[data-test=\'UrlInput\']' ).simulate( 'change' );
		expect( onChangeMock ).toHaveBeenCalledTimes( 2 );
	} );
	it( 'should close the form when user clicks Close button', () => {
		const wrapper = shallow( <UrlInputButton /> );
		clickEditLink( wrapper );
		expect( wrapper.state().expanded ).toBe( true );
		wrapper.find( '.editor-url-input__back' ).simulate( 'click' );
		expect( wrapper.state().expanded ).toBe( false );
	} );
	it( 'should close the form when user submits it', () => {
		const wrapper = mount( <UrlInputButton /> );
		clickEditLink( wrapper );
		expect( wrapper.state().expanded ).toBe( true );
		wrapper.find( 'form' ).simulate( 'submit' );
		expect( wrapper.state().expanded ).toBe( false );
		wrapper.unmount();
	} );
} );
