/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import SubMasterbarNav from '../';
import Dropdown from '../dropdown';
import Navbar from '../navbar';

describe( 'SubMasterbarNav', () => {
	const options = [
		{ label: 'sites', uri: '/sites', icon: 'star' },
		{ label: 'more', uri: '/more', icon: 'star' }
	];

	it( 'should render a navbar and a dropdown with the given options', () => {
		const wrapper = shallow( <SubMasterbarNav options={ options } uri="/" /> );
		const dropdown = wrapper.find( Dropdown );
		const navbar = wrapper.find( Navbar );

		expect( dropdown.prop( 'options' ) ).to.equal( options );
		expect( navbar.prop( 'options' ) ).to.equal( options );
	} );

	it( 'should pass the selected option to the dropdown', () => {
		const wrapper = shallow( <SubMasterbarNav options={ options } uri="/more" /> );
		const dropdown = wrapper.find( Dropdown );

		expect( dropdown.prop( 'options' ) ).to.equal( options );
		expect( dropdown.prop( 'selected' ) ).to.equal( options[ 1 ] );
	} );

	it( 'should pass the fallback as selected to the dropdown if none of the options is selected', () => {
		const fallback = { label: 'Select...', uri: '#' };

		const wrapper = shallow( <SubMasterbarNav options={ options } uri="/foo" fallback={ fallback } /> );
		const dropdown = wrapper.find( Dropdown );

		expect( dropdown.prop( 'options' ) ).to.equal( options );
		expect( dropdown.prop( 'selected' ) ).to.equal( fallback );
	} );

	it( 'should pass the selected option to the navbar', () => {
		const wrapper = shallow( <SubMasterbarNav options={ options } uri="/sites" /> );
		const navbar = wrapper.find( Navbar );

		expect( navbar.prop( 'options' ) ).to.equal( options );
		expect( navbar.prop( 'selected' ) ).to.equal( options[ 0 ] );
	} );

	it( 'should not pass the fallback as selected to the navbar when nothing is selected', () => {
		const fallback = { label: 'Select...', uri: '#' };

		const wrapper = shallow( <SubMasterbarNav options={ options } uri="/foo" fallback={ fallback } /> );
		const navbar = wrapper.find( Navbar );

		expect( navbar.prop( 'options' ) ).to.equal( options );
		expect( navbar.prop( 'selected' ) ).to.equal( undefined );
	} );
} );
