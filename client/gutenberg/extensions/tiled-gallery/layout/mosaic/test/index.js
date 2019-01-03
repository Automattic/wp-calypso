/**
 * External dependencies
 */
import React from 'react';
import { range } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Mosaic from '..';
import * as imageSets from '../../test/fixtures/image-sets';

test( 'renders as expected', () => {
	Object.keys( imageSets ).forEach( k => {
		const images = imageSets[ k ];
		expect(
			shallow( <Mosaic images={ images } renderedImages={ range( images.length ) } /> )
		).toMatchSnapshot();
	} );
} );
