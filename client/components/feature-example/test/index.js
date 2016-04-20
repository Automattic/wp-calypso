/**
 * External dependencies
 */
import { assert } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import FeatureExample from '../index';

describe( 'Feature Example', function() {
	it( 'should have Feature-example class', function() {
		const featureExample = shallow( <FeatureExample /> );
		assert.equal( 1, featureExample.find( '.feature-example' ).length );
	} );

	// TODO: fix it
	it.skip( 'should contains the passed children wrapped by a feature-example div', function() {
		const featureExample = shallow( <FeatureExample><div>test</div></FeatureExample> );
		assert.equal( true, featureExample.contains( '<div>test</div>' ) );
	} );
} );
