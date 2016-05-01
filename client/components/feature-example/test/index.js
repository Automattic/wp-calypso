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
	it( 'should have Feature-example class', () => {
		const featureExample = shallow( <FeatureExample /> );
		assert.lengthOf( featureExample.find( '.feature-example' ), 1 );
	} );

	it( 'should contains the passed children wrapped by a feature-example div', () => {
		const featureExample = shallow( <FeatureExample><div>test</div></FeatureExample> );
		assert.isTrue( featureExample.contains( <div>test</div> ) );
	} );
} );
