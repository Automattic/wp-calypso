/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import Item from '../item';
import Navbar from '../navbar';

describe( 'Navbar', () => {
	const options = [
		{ label: 'sites', uri: '/sites', icon: 'star' },
		{ label: 'more', uri: '/more', icon: 'star' },
	];

	test( 'should render a navbar given a list of options', () => {
		const wrapper = shallow( <Navbar options={ options } />, { disableLifecycleMethods: true } );

		const items = wrapper.find( Item );

		expect( items.length ).to.equal( 2 );

		expect( items.at( 0 ).prop( 'label' ) ).to.equal( 'sites' );
		expect( items.at( 1 ).prop( 'label' ) ).to.equal( 'more' );

		expect( items.at( 0 ).prop( 'icon' ) ).to.equal( 'star' );
		expect( items.at( 1 ).prop( 'icon' ) ).to.equal( 'star' );

		expect( items.at( 0 ).prop( 'isSelected' ) ).to.equal( false );
		expect( items.at( 1 ).prop( 'isSelected' ) ).to.equal( false );
	} );

	test( 'should higlight currently selected option', () => {
		const wrapper = shallow( <Navbar selected={ options[ 1 ] } options={ options } />, {
			disableLifecycleMethods: true,
		} );

		const items = wrapper.find( Item );

		expect( items.length ).to.equal( 2 );

		expect( items.at( 0 ).prop( 'label' ) ).to.equal( 'sites' );
		expect( items.at( 1 ).prop( 'label' ) ).to.equal( 'more' );

		expect( items.at( 0 ).prop( 'isSelected' ) ).to.equal( false );
		expect( items.at( 1 ).prop( 'isSelected' ) ).to.equal( true );
	} );
} );
