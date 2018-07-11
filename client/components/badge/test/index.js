/** @format */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import Badge from '../index';

describe( 'Badge', () => {
	test( 'should have badge class', () => {
		const featureExample = shallow( <Badge /> );
		assert.lengthOf( featureExample.find( '.badge' ), 1 );
	} );

	test( 'should have proper type class (warning)', () => {
		const badge = shallow( <Badge type="warning" /> );
		assert.lengthOf( badge.find( '.badge.badge--warning' ), 1 );
	} );

	test( 'should have proper type class (success)', () => {
		const badge = shallow( <Badge type="success" /> );
		assert.lengthOf( badge.find( '.badge.badge--success' ), 1 );
	} );

	test( 'should have proper type class (default)', () => {
		const badge = shallow( <Badge /> );
		assert.lengthOf( badge.find( '.badge.badge--warning' ), 1 );
	} );

	test( 'should contains the passed children wrapped by a feature-example div', () => {
		const featureExample = shallow(
			<Badge>
				<div>test</div>
			</Badge>
		);
		assert.isTrue( featureExample.contains( <div>test</div> ) );
	} );
} );
