/** @format */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import { identity } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { Notice } from '../index';

describe( 'Notice', () => {
	test( 'should output the component', () => {
		const wrapper = shallow( <Notice translate={ identity } /> );
		expect( wrapper.find( '.notice' ).length ).toBeTruthy();
	} );

	test( 'should have dismiss button when showDismiss passed as true', () => {
		const wrapper = shallow( <Notice showDismiss={ true } translate={ identity } /> );
		expect( wrapper.find( '.is-dismissable' ).length ).toBeTruthy();
	} );

	test( 'should have dismiss button by default if isCompact is false', () => {
		const wrapper = shallow( <Notice isCompact={ false } translate={ identity } /> );
		expect( wrapper.find( '.is-dismissable' ).length ).toBeTruthy();
	} );

	test( 'should have compact look when isCompact passed as true', () => {
		const wrapper = shallow( <Notice isCompact={ true } translate={ identity } /> );
		expect( wrapper.find( '.is-compact' ).length ).toBeTruthy();
	} );

	test( 'should not have dismiss button by default if isCompact is true', () => {
		const wrapper = shallow( <Notice isCompact={ true } translate={ identity } /> );
		expect( wrapper.find( '.is-dismissable' ).length === 0 ).toBeTruthy();
	} );

	test( 'should have dismiss button when showDismiss is true and isCompact is true', () => {
		const wrapper = shallow(
			<Notice isCompact={ true } showDismiss={ true } translate={ identity } />
		);
		expect( wrapper.find( '.is-dismissable' ).length ).toBeTruthy();
	} );

	test( 'should have proper class for is-info status parameter', () => {
		const wrapper = shallow( <Notice status="is-info" translate={ identity } /> );
		expect( wrapper.find( '.is-info' ).length ).toBeTruthy();
	} );

	test( 'should have proper class for is-success status parameter', () => {
		const wrapper = shallow( <Notice status="is-success" translate={ identity } /> );
		expect( wrapper.find( '.is-success' ).length ).toBeTruthy();
	} );

	test( 'should have proper class for is-error status parameter', () => {
		const wrapper = shallow( <Notice status="is-error" translate={ identity } /> );
		expect( wrapper.find( '.is-error' ).length ).toBeTruthy();
	} );

	test( 'should have proper class for is-warning status parameter', () => {
		const wrapper = shallow( <Notice status="is-warning" translate={ identity } /> );
		expect( wrapper.find( '.is-warning' ).length ).toBeTruthy();
	} );
} );
