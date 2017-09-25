/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import mockery from 'mockery';
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyComponent from 'test/helpers/react/empty-component';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'PluginAction', function() {
	let mount, PluginAction;

	useFakeDom();
	useMockery();

	before( () => {
		mount = require( 'enzyme' ).mount;
		mockery.registerMock( 'components/info-popover', EmptyComponent );

		PluginAction = require( '../plugin-action' );
	} );

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
