/** @jest-environment jsdom */
jest.mock( 'components/info-popover', () => require( 'components/empty-component' ) );

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

describe( 'PluginAction', function() {
	describe( 'rendering with form toggle', function() {
		it( 'should have plugin-action class', function() {
			const wrapper = shallow( <PluginAction /> );

			expect( wrapper.find( '.plugin-action' ) ).to.have.lengthOf( 1 );
		} );

		it( 'should render compact form toggle when no children passed', function() {
			const wrapper = mount( <PluginAction /> );

			expect( wrapper.find( '.form-toggle' ) ).to.have.lengthOf( 1 );
		} );

		it( 'should render a plugin action label', function() {
			const wrapper = shallow( <PluginAction label="hello"><span /></PluginAction> );

			expect( wrapper.find( '.plugin-action__label' ) ).to.have.lengthOf( 1 );
		} );
	} );

	describe( 'rendering children', function() {
		it( 'should not render a form toggle when children exist', function() {
			const wrapper = mount( <PluginAction><span /></PluginAction> );

			expect( wrapper.find( '.form-toggle' ) ).to.have.lengthOf( 0 );
		} );

		it( 'should render child within plugin-action__children container', function() {
			const wrapper = mount( <PluginAction><span /></PluginAction> ),
				children = wrapper.find( '.plugin-action__children' );

			expect( children.length ).to.equal( 1 );
			expect( children.props().children.type ).to.equal( 'span' );
		} );

		it( 'should render a plugin action label', function() {
			const wrapper = mount( <PluginAction label="hello"><span /></PluginAction> );

			expect( wrapper.find( '.plugin-action__label' ) ).to.have.lengthOf( 1 );
		} );
	} );
} );
