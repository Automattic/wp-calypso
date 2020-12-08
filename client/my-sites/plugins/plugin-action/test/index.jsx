/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import PluginAction from '../plugin-action';

jest.mock( 'components/info-popover', () => require( 'calypso/components/empty-component' ) );

describe( 'PluginAction', () => {
	describe( 'rendering with form toggle', () => {
		test( 'should have plugin-action class', () => {
			const wrapper = shallow( <PluginAction /> );

			expect( wrapper.find( '.plugin-action' ) ).to.have.lengthOf( 1 );
		} );

		test( 'should render compact form toggle when no children passed', () => {
			const wrapper = mount( <PluginAction /> );

			expect( wrapper.find( 'input.components-form-toggle__input' ) ).to.have.lengthOf( 1 );
		} );

		test( 'should render a plugin action label', () => {
			const wrapper = shallow(
				<PluginAction label="hello">
					<span />
				</PluginAction>
			);

			expect( wrapper.find( '.plugin-action__label' ) ).to.have.lengthOf( 1 );
		} );
	} );

	describe( 'rendering children', () => {
		test( 'should not render a form toggle when children exist', () => {
			const wrapper = mount(
				<PluginAction>
					<span />
				</PluginAction>
			);

			expect( wrapper.find( '.components-form-toggle__input' ) ).to.have.lengthOf( 0 );
		} );

		test( 'should render child within plugin-action__children container', () => {
			const wrapper = mount(
				<PluginAction>
					<span />
				</PluginAction>
			);
			const children = wrapper.find( '.plugin-action__children' );

			expect( children.length ).to.equal( 1 );
			expect( children.props().children[ 0 ].type ).to.equal( 'span' );
		} );

		test( 'should render a plugin action label', () => {
			const wrapper = mount(
				<PluginAction label="hello">
					<span />
				</PluginAction>
			);

			expect( wrapper.find( '.plugin-action__label' ) ).to.have.lengthOf( 1 );
		} );
	} );
} );
