/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Gridicon from 'calypso/components/gridicon';
import React from 'react';

/**
 * Internal dependencies
 */
import Item from '../item';

describe( 'Item', () => {
	test( 'should render a link containing the given label', () => {
		const item = shallow( <Item label={ 'test item' } /> );
		const label = item.find( '.sub-masterbar-nav__label' );

		expect( label.length ).to.equal( 1 );
		expect( label.text() ).to.equal( 'test item' );
	} );

	test( 'should link to the passed url', () => {
		const item = shallow( <Item label={ 'home' } href={ 'https://wordpress.com' } /> );

		expect( item.prop( 'href' ) ).to.equal( 'https://wordpress.com' );
	} );

	test( 'should be selectable', () => {
		const item = shallow( <Item label={ 'test item' } isSelected={ true } /> );

		expect( item.hasClass( 'is-selected' ) ).to.equal( true );
	} );

	test( 'should not be selected by default', () => {
		const item = shallow( <Item label={ 'test item' } /> );

		expect( item.hasClass( 'is-selected' ) ).to.equal( false );
	} );

	test( 'should display a given gridicon', () => {
		const item = shallow( <Item label={ 'test item' } icon={ 'globe' } /> );
		const icon = item.find( Gridicon );

		expect( icon.prop( 'icon' ) ).to.equal( 'globe' );
	} );

	test( "should display a 'star' gridicon by default", () => {
		const item = shallow( <Item label={ 'test item' } /> );
		const icon = item.find( Gridicon );

		expect( icon.prop( 'icon' ) ).to.equal( 'star' );
	} );
} );
