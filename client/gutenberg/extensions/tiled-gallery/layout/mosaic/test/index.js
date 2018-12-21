/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Mosaic from '..';
import * as imageSets from '../../test/fixtures/image-sets';

const defaultProps = {
	onRemoveImage: noop,
	onSelectImage: noop,
	setImageAttributes: noop,
};

test( 'renders as expected', () => {
	Object.keys( imageSets ).forEach( k => {
		const images = imageSets[ k ];
		expect(
			shallow(
				<Mosaic { ...defaultProps } ImageComponent={ 'image-component' } images={ images } />
			)
		).toMatchSnapshot();
	} );
} );
