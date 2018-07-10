/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { DefaultBlockAppender } from '../';

describe( 'DefaultBlockAppender', () => {
	const expectOnAppendCalled = ( onAppend ) => {
		expect( onAppend ).toHaveBeenCalledTimes( 1 );
		expect( onAppend ).toHaveBeenCalledWith();
	};

	it( 'should render nothing if not visible', () => {
		const wrapper = shallow( <DefaultBlockAppender /> );

		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should match snapshot', () => {
		const onAppend = jest.fn();
		const wrapper = shallow( <DefaultBlockAppender isVisible onAppend={ onAppend } showPrompt /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	it( 'should append a default block when input clicked', () => {
		const onAppend = jest.fn();
		const wrapper = shallow( <DefaultBlockAppender isVisible onAppend={ onAppend } showPrompt /> );
		const input = wrapper.find( 'input.editor-default-block-appender__content' );

		expect( input.prop( 'value' ) ).toEqual( 'Write your story' );
		input.simulate( 'click' );

		expectOnAppendCalled( onAppend );
	} );

	it( 'should append a default block when input focused', () => {
		const onAppend = jest.fn();
		const wrapper = shallow( <DefaultBlockAppender isVisible onAppend={ onAppend } showPrompt /> );

		wrapper.find( 'input.editor-default-block-appender__content' ).simulate( 'focus' );

		expect( wrapper ).toMatchSnapshot();

		expectOnAppendCalled( onAppend );
	} );

	it( 'should optionally show without prompt', () => {
		const onAppend = jest.fn();
		const wrapper = shallow( <DefaultBlockAppender isVisible onAppend={ onAppend } showPrompt={ false } /> );
		const input = wrapper.find( 'input.editor-default-block-appender__content' );

		expect( input.prop( 'value' ) ).toEqual( '' );

		expect( wrapper ).toMatchSnapshot();
	} );
} );
