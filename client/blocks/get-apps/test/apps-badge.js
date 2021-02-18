/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { AppsBadge } from '../apps-badge';

jest.mock( 'calypso/lib/i18n-utils', () => ( {
	getLocaleSlug: () => {
		return 'en';
	},
} ) );

describe( 'AppsBadge', () => {
	const defaultProps = {
		altText: 'titleText',
		storeLink: 'https://wordpress.com',
		storeName: 'ios',
		titleText: 'titleText',
		translate: identity,
	};

	test( 'should render', () => {
		const wrapper = shallow( <AppsBadge { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );
} );
