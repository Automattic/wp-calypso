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
jest.mock( 'gutenberg-blocks', () => 'GutenbergBlocks' );
jest.mock( '@wordpress/components', () => 'GutenbergComponents' );

describe( 'ComponentPlayground', () => {
	test( 'LiveProvider should use the components scope by default', () => {
		const wrapper = shallow(
			<ComponentPlayground section="foo" code="foo" name="foo" url="foo" />
		);
		const liveProvider = wrapper.find( LiveProvider );
		expect( liveProvider.props().scope ).toBe( 'PlaygroundScope' );
	} );

	test(
		'LiveProvider should use the Gutenberg components scope when section is Gutenberg' +
			' components',
		() => {
			const wrapper = shallow(
				<ComponentPlayground section="gutenberg-components" code="foo" name="foo" url="foo" />
			);
			const liveProvider = wrapper.find( LiveProvider );
			expect( liveProvider.props().scope ).toBe( 'GutenbergComponents' );
		}
	);

	test( 'LiveProvider should use the Gutenberg blocks scope when section is Gutenberg blocks', () => {
		const wrapper = shallow(
			<ComponentPlayground section="gutenberg-blocks" code="foo" name="foo" url="foo" />
		);
		const liveProvider = wrapper.find( LiveProvider );
		expect( liveProvider.props().scope ).toBe( 'GutenbergBlocks' );
	} );
} );
