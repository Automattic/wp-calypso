/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import deepFreeze from 'deep-freeze';
import { identity, noop } from 'lodash';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import Theme from 'calypso/components/theme';
import { ThemesList } from '../';

const defaultProps = deepFreeze( {
	themes: [
		{
			id: '1',
			name: 'kubrick',
			screenshot: '/theme/kubrick/screenshot.png',
		},
		{
			id: '2',
			name: 'picard',
			screenshot: '/theme/picard/screenshot.png',
		},
	],
	lastPage: true,
	loading: false,
	fetchNextPage: noop,
	getButtonOptions: noop,
	onScreenshotClick: noop,
	translate: identity,
} );

describe( 'ThemesList', () => {
	test( 'should declare propTypes', () => {
		expect( ThemesList ).toHaveProperty( 'propTypes' );
	} );

	test( 'should render a div with a className of "themes-list"', () => {
		const wrapper = shallow( <ThemesList { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.hasClass( 'themes-list' ) ).toBe( true );
		expect( wrapper.find( Theme ) ).toHaveLength( defaultProps.themes.length );
	} );

	test( 'should render a <Theme /> child for each provided theme', () => {
		const wrapper = shallow( <ThemesList { ...defaultProps } /> );
		expect( wrapper.find( Theme ) ).toHaveLength( defaultProps.themes.length );
	} );

	test( 'should display the EmptyContent component when no themes are found', () => {
		const wrapper = shallow( <ThemesList { ...defaultProps } themes={ [] } /> );
		expect( wrapper.type() ).toBe( EmptyContent );
	} );
} );
