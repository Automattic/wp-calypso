/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import GSuiteSingleFeature from '../single-feature';

describe( 'GSuiteSingleFeature', () => {
	test( 'it renders GSuiteSingleFeature', () => {
		const tree = renderer
			.create(
				<GSuiteSingleFeature
					title={ 'title' }
					description={ 'description' }
					imagePath={ '/test/image/path.svg' }
					imageAlt={ 'image alt' }
					compact={ false }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
