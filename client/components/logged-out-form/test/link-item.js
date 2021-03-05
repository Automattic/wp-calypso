/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import LoggedOutFormLinkItem from '../link-item';

describe( 'LoggedOutFormLinkItem', () => {
	test( 'should render an <a> element', () => {
		const wrapper = shallow(
			<LoggedOutFormLinkItem href="http://example.com">Example text here</LoggedOutFormLinkItem>
		);

		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.type() ).toBe( 'a' );
	} );

	test( 'should include own class and append passed class', () => {
		const testClass = 'test-classname';
		const wrapper = shallow( <LoggedOutFormLinkItem className={ testClass } /> );

		expect( wrapper.hasClass( testClass ) ).toBe( true );
		expect( wrapper.hasClass( 'logged-out-form__link-item' ) ).toBe( true );
	} );
} );
