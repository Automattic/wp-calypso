/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Item from '../item';
import Gridicon from 'gridicons';

describe( 'Item', () => {
	it( 'should render a link containing the given label', () => {
		const item = shallow( <Item label={ 'test item' } /> );
		const label = item.find( '.sub-masterbar-nav__label' );

		expect( label.length ).to.equal( 1 );
		expect( label.text() ).to.equal( 'test item' );
	} );

	it( 'should link to the passed url', () => {
		const item = shallow( <Item label={ 'home' } href={ 'https://wordpress.com' } /> );

		expect( item.prop( 'href' ) ).to.equal( 'https://wordpress.com' );
	} );

	it( 'should be selectable', () => {
		const item = shallow( <Item label={ 'test item' } isSelected={ true } /> );

		expect( item.hasClass( 'is-selected' ) ).to.equal( true );
	} );

	it( 'should not be selected by default', () => {
		const item = shallow( <Item label={ 'test item' } /> );

		expect( item.hasClass( 'is-selected' ) ).to.equal( false );
	} );

	it( 'should display a given gridicon', () => {
		const item = shallow( <Item label={ 'test item' } icon={ 'globe' } /> );
		const icon = item.find( Gridicon );

		expect( icon.prop( 'icon' ) ).to.equal( 'globe' );
	} );

	it( 'should display a \'star\' gridicon by default', () => {
		const item = shallow( <Item label={ 'test item' } /> );
		const icon = item.find( Gridicon );

		expect( icon.prop( 'icon' ) ).to.equal( 'star' );
	} );
} );
