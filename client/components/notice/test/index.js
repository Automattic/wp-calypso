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
import { UnwrappedNotice } from '../index';

describe( 'index', function() {
	require( 'test/helpers/use-fake-dom' )();
	it( 'should output the component', function() {
		const wrapper = shallow( <UnwrappedNotice translate={ identity } /> );
		assert.equal( true, wrapper.find( '.notice' ).length );
	} );

} );
