/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import SelectDropdownItem from '../item';

describe( 'item', () => {
	describe( 'component rendering', () => {
		test( 'should render a list entry', () => {
			const dropdownItem = shallow( <SelectDropdownItem>Published</SelectDropdownItem> );
			expect( dropdownItem.is( 'li.select-dropdown__option' ) ).to.be.true;
		} );

		test( 'should contain a link', () => {
			const dropdownItem = shallow( <SelectDropdownItem>Published</SelectDropdownItem> );
			expect( dropdownItem.children( 'a.select-dropdown__item' ).length ).to.eql( 1 );
			expect( dropdownItem.find( 'span.select-dropdown__item-text' ).text() ).to.eql( 'Published' );
		} );
	} );

	describe( 'when the component is clicked', () => {
		test( 'should do nothing when is disabled', () => {
			const onClickSpy = sinon.spy();
			const dropdownItem = shallow(
				<SelectDropdownItem disabled onClick={ onClickSpy }>
					Published
				</SelectDropdownItem>
			);

			const link = dropdownItem.children( 'a.select-dropdown__item' );
			expect( link.hasClass( 'is-disabled' ) ).to.be.true;

			link.simulate( 'click' );
			sinon.assert.notCalled( onClickSpy );
		} );

		test( 'should run the `onClick` hook', () => {
			const onClickSpy = sinon.spy();
			const dropdownItem = shallow(
				<SelectDropdownItem onClick={ onClickSpy }>Published</SelectDropdownItem>
			);
			dropdownItem.children( 'a.select-dropdown__item' ).simulate( 'click' );
			sinon.assert.calledOnce( onClickSpy );
		} );
	} );
} );
