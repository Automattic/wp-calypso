/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { Notice } from '../index';

describe( 'Notice', function() {
	it( 'should output the component', function() {
		const wrapper = shallow( <Notice translate={ identity } /> );
		assert.isOk( wrapper.find( '.notice' ).length );
	} );

	it( 'should have dismiss button when showDismiss passed as true', function() {
		const wrapper = shallow( <Notice showDismiss={ true } translate={ identity } /> );
		assert.isOk( wrapper.find( '.is-dismissable' ).length );
	} );

	it( 'should have compact look when isCompact passed as true', function() {
		const wrapper = shallow( <Notice isCompact={ true } translate={ identity } /> );
		assert.isOk( wrapper.find( '.is-compact' ).length );
	} );

	it( 'should have proper class for is-info status parameter', function() {
		const wrapper = shallow( <Notice status="is-info" translate={ identity } /> );
		assert.isOk( wrapper.find( '.is-info' ).length );
	} );

	it( 'should have proper class for is-success status parameter', function() {
		const wrapper = shallow( <Notice status="is-success" translate={ identity } /> );
		assert.isOk( wrapper.find( '.is-success' ).length );
	} );

	it( 'should have proper class for is-error status parameter', function() {
		const wrapper = shallow( <Notice status="is-error" translate={ identity } /> );
		assert.isOk( wrapper.find( '.is-error' ).length );
	} );

	it( 'should have proper class for is-warning status parameter', function() {
		const wrapper = shallow( <Notice status="is-warning" translate={ identity } /> );
		assert.isOk( wrapper.find( '.is-warning' ).length );
	} );
} );
