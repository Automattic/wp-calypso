/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { Notice } from '../index';

describe( 'Notice', () => {
	const translate = ( string ) => string;

	test( 'should output the component', () => {
		const wrapper = shallow( <Notice translate={ translate } /> );
		assert.isOk( wrapper.find( '.notice' ).length );
	} );

	test( 'should have dismiss button when showDismiss passed as true', () => {
		const wrapper = shallow( <Notice showDismiss={ true } translate={ translate } /> );
		assert.isOk( wrapper.find( '.is-dismissable' ).length );
	} );

	test( 'should have dismiss button by default if isCompact is false', () => {
		const wrapper = shallow( <Notice isCompact={ false } translate={ translate } /> );
		assert.isOk( wrapper.find( '.is-dismissable' ).length );
	} );

	test( 'should have compact look when isCompact passed as true', () => {
		const wrapper = shallow( <Notice isCompact={ true } translate={ translate } /> );
		assert.isOk( wrapper.find( '.is-compact' ).length );
	} );

	test( 'should not have dismiss button by default if isCompact is true', () => {
		const wrapper = shallow( <Notice isCompact={ true } translate={ translate } /> );
		assert.isOk( wrapper.find( '.is-dismissable' ).length === 0 );
	} );

	test( 'should have dismiss button when showDismiss is true and isCompact is true', () => {
		const wrapper = shallow(
			<Notice isCompact={ true } showDismiss={ true } translate={ translate } />
		);
		assert.isOk( wrapper.find( '.is-dismissable' ).length );
	} );

	test( 'should have proper class for is-info status parameter', () => {
		const wrapper = shallow( <Notice status="is-info" translate={ translate } /> );
		assert.isOk( wrapper.find( '.is-info' ).length );
	} );

	test( 'should have proper class for is-success status parameter', () => {
		const wrapper = shallow( <Notice status="is-success" translate={ translate } /> );
		assert.isOk( wrapper.find( '.is-success' ).length );
	} );

	test( 'should have proper class for is-error status parameter', () => {
		const wrapper = shallow( <Notice status="is-error" translate={ translate } /> );
		assert.isOk( wrapper.find( '.is-error' ).length );
	} );

	test( 'should have proper class for is-warning status parameter', () => {
		const wrapper = shallow( <Notice status="is-warning" translate={ translate } /> );
		assert.isOk( wrapper.find( '.is-warning' ).length );
	} );
} );
