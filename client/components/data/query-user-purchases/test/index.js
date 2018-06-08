/**
 * @format
 *
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import { QueryUserPurchases } from '..';

/**
 * NOTE:
 *
 * `mount` is used in the methods checking `componentDidUpdate` behavior
 * becuase `shallow` does not call that method on props update at this time.
 */

test( 'should call fetchUserPurchases on mount', () => {
	const spy = jest.fn();
	mount( <QueryUserPurchases userId={ 123 } fetchUserPurchases={ spy } /> );
	expect( spy ).toHaveBeenCalled();
} );

test( 'should not call fetchUserPurchases with updated props, same userId', async () => {
	const userId = 123;
	const spy = jest.fn();
	const wrapper = mount( <QueryUserPurchases userId={ userId } fetchUserPurchases={ spy } /> );
	await new Promise( resolve => wrapper.setProps( { userId }, resolve ) );
	await new Promise( resolve => wrapper.setProps( { userId }, resolve ) );
	await new Promise( resolve => wrapper.setProps( { userId }, resolve ) );
	expect( spy ).toHaveBeenCalledTimes( 1 );
} );

test( 'should call fetchUserPurchases with updated new userId prop', async () => {
	const spy = jest.fn();
	const wrapper = mount( <QueryUserPurchases userId={ 123 } fetchUserPurchases={ spy } /> );
	expect( spy ).toHaveBeenCalledWith( 123 );
	await new Promise( resolve => wrapper.setProps( { userId: 456 }, resolve ) );
	expect( spy ).toHaveBeenLastCalledWith( 456 );
	expect( spy ).toHaveBeenCalledTimes( 2 );
} );
