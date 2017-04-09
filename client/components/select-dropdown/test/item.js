/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import SelectDropdownItem from '../item';

describe( 'item', function() {
	useFakeDom();

	describe( 'component rendering', function() {
		it( 'should render a list entry', function() {
			const dropdownItem = shallow( <SelectDropdownItem>Published</SelectDropdownItem> );
			expect( dropdownItem.is( 'li.select-dropdown__option' ) ).to.be.true;
		} );

		it( 'should contain a link', function() {
			const dropdownItem = shallow( <SelectDropdownItem>Published</SelectDropdownItem> );
			expect( dropdownItem.children( 'a.select-dropdown__item' ).length ).to.eql( 1 );
			expect( dropdownItem.find( 'span.select-dropdown__item-text' ).text() ).to.eql( 'Published' );
		} );

		it( 'should not have `tabindex` attribute, when the parent dropdown is closed', function() {
			const dropdownItem = shallow( <SelectDropdownItem isDropdownOpen={ false }>Published</SelectDropdownItem> );
			expect( dropdownItem.children( { tabIndex: 0 } ).length ).to.eql( 0 );
		} );

		it( 'should have `tabindex` attribute set to `0`, only when the parent dropdown is open (issue#9206)', function() {
			const dropdownItem = shallow( <SelectDropdownItem isDropdownOpen={ true }>Published</SelectDropdownItem> );
			expect( dropdownItem.children( { tabIndex: 0 } ).length ).to.eql( 1 );
		} );
	} );

	describe( 'when the component is clicked', function() {
		it( 'should do nothing when is disabled', function() {
			const onClickSpy = sinon.spy();
			const dropdownItem = shallow( <SelectDropdownItem disabled={ true } onClick={ onClickSpy }>Published</SelectDropdownItem> );

			const link = dropdownItem.children( 'a.select-dropdown__item' );
			expect( link.hasClass( 'is-disabled' ) ).to.be.true;

			link.simulate( 'click' );
			sinon.assert.notCalled( onClickSpy );
		} );

		it( 'should run the `onClick` hook', function() {
			const onClickSpy = sinon.spy();
			const dropdownItem = shallow( <SelectDropdownItem onClick={ onClickSpy }>Published</SelectDropdownItem> );
			dropdownItem.children( 'a.select-dropdown__item' ).simulate( 'click' );
			sinon.assert.calledOnce( onClickSpy );
		} );
	} );
} );
