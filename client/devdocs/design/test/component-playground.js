/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { LiveProvider } from 'react-live';

/**
 * Internal dependencies
 */
import ComponentPlayground from '../component-playground';

jest.mock( 'devdocs/design/playground-scope', () => 'PlaygroundScope' );

describe( 'ComponentPlayground', () => {
	test( 'LiveProvider should use the components scope by default', () => {
		const wrapper = shallow(
			<ComponentPlayground section="foo" code="foo" name="foo" url="foo" />
		);
		const liveProvider = wrapper.find( LiveProvider );
		expect( liveProvider.props().scope ).toBe( 'PlaygroundScope' );
	} );
} );
