/**
 * External dependencies
 */
import Adapter from 'enzyme-adapter-react-16';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';
import { createSerializer } from 'enzyme-to-json';
import { range } from 'lodash';

/**
 * Internal dependencies
 */
import Mosaic from '..';
import * as imageSets from '../../test/fixtures/image-sets';

Enzyme.configure( { adapter: new Adapter() } );
expect.addSnapshotSerializer( createSerializer( { mode: 'deep' } ) );

test( 'renders as expected', () => {
	Object.keys( imageSets ).forEach( k => {
		const images = imageSets[ k ];
		expect(
			shallow( <Mosaic images={ images } renderedImages={ range( images.length ) } /> )
		).toMatchSnapshot();
	} );
} );
