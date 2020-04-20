/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import Dropdown from '../dropdown';
import Item from '../item';

describe( 'Dropdown', () => {
	const options = [
		{ label: 'sites', uri: '/sites', icon: 'star' },
		{ label: 'more', uri: '/more', icon: 'star' },
	];

	test( 'should render a dropdown given a list of options and the current selection', () => {
		const wrapper = shallow(
			<Dropdown selected={ { label: 'Select option', icon: 'home' } } options={ options } />,
			{ disableLifecycleMethods: true }
		);

		const select = wrapper.find( '.sub-masterbar-nav__select' );
		const selected = select.find( Item );

		expect( selected ).prop( 'label' ).to.equal( 'Select option' );
		expect( selected ).prop( 'icon' ).to.equal( 'home' );

		const list = wrapper.find( '.sub-masterbar-nav__items' );
		const items = list.find( Item );

		expect( items.length ).to.equal( 2 );
		expect( items.at( 0 ).prop( 'label' ) ).to.equal( 'sites' );
		expect( items.at( 1 ).prop( 'label' ) ).to.equal( 'more' );
		expect( items.at( 0 ).prop( 'icon' ) ).to.equal( 'star' );
		expect( items.at( 1 ).prop( 'icon' ) ).to.equal( 'star' );
	} );

	test( 'should be toggled by clicking the selected item', () => {
		const wrapper = shallow(
			<Dropdown selected={ { label: 'Select option', icon: 'home' } } options={ options } />,
			{ disableLifecycleMethods: true }
		);

		expect( wrapper.hasClass( 'is-collapsed' ) ).to.equal( true );

		wrapper.find( '.sub-masterbar-nav__select' ).simulate( 'click' );

		expect( wrapper.hasClass( 'is-collapsed' ) ).to.equal( false );

		wrapper.find( '.sub-masterbar-nav__select' ).simulate( 'click' );

		expect( wrapper.hasClass( 'is-collapsed' ) ).to.equal( true );
	} );

	test( 'should close after invoking onSelect from its children', () => {
		const wrapper = shallow(
			<Dropdown selected={ { label: 'Select option', icon: 'home' } } options={ options } />,
			{ disableLifecycleMethods: true }
		);

		wrapper.find( '.sub-masterbar-nav__select' ).simulate( 'click' );

		expect( wrapper.hasClass( 'is-collapsed' ) ).to.equal( false );

		wrapper.find( '.sub-masterbar-nav__items' ).find( Item ).at( 1 ).simulate( 'click' );

		expect( wrapper.hasClass( 'is-collapsed' ) ).to.equal( true );
	} );
} );
