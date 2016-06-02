/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import { shallow } from 'enzyme';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import Checkbox from '../index';

describe( 'Checkbox', function() {
	describe( 'Rendering ', function() {
		it( 'should render not Gridicon when not checked', function() {
			const checkbox = shallow( <Checkbox isChecked={ false } /> );
			expect( checkbox.find( Gridicon ) ).to.have.length( 0 );
			expect( checkbox.html() ).to.not.contain( 'checked' );
		} );

		it( 'should render Gridicon when checked', function() {
			const checkbox = shallow( <Checkbox isChecked={ true } /> );
			expect( checkbox.find( Gridicon ) ).to.have.length( 1 );
			expect( checkbox.html() ).to.contain( 'checked' );
		} );

		it( 'should render custom classes properly', function() {
			const checkbox = shallow( <Checkbox className="foo" isChecked={ true } /> );
			expect( checkbox.find( '.foo' ) ).to.have.length( 1 );
		} );

		it( 'should not render disabled by default', function() {
			const checkbox = shallow( <Checkbox isChecked={ true } /> );
			expect( checkbox.html() ).to.not.contain( 'disabled' );
		} );

		it( 'should render disabled if true', function() {
			const checkbox = shallow( <Checkbox isDisabled={ true } isChecked={ true } /> );
			expect( checkbox.html() ).to.contain( 'disabled' );
		} );
	} );

	describe( 'Events', function() {
		it( 'should pass change events', function() {
			const onChange = sinon.spy();
			const checkbox = shallow( <Checkbox isChecked={ false } onChange={ onChange } /> );

			checkbox.find( 'input' ).simulate( 'change' );
			expect( onChange.calledOnce ).to.equal( true );
		} );
	} );
} );
