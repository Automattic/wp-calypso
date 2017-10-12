/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import { ThemesList } from '../';

jest.mock( 'components/pulsing-dot', () => require( 'components/empty-component' ) );
jest.mock( 'components/theme/more-button', () => require( 'components/empty-component' ) );

describe( 'ThemesList', () => {
	let props, themesList, themesListElement;

	beforeEach( () => {
		props = {
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
			translate: x => x, // Mock translate()
		};

		themesList = React.createElement( ThemesList, props );
	} );

	describe( 'propTypes', () => {
		test( 'specifies the required propType', () => {
			expect( themesList.type.propTypes.themes ).toBeTruthy();
		} );
	} );

	describe( 'rendering', () => {
		beforeEach( () => {
			const shallowRenderer = TestUtils.createRenderer();

			shallowRenderer.render( themesList );
			themesListElement = shallowRenderer.getRenderOutput();
		} );

		test( 'should render a div with a className of "themes-list"', () => {
			expect( themesListElement ).toBeTruthy();
			expect( themesListElement.props.className === 'themes-list' ).toBeTruthy();
		} );

		describe( 'when no themes are found', () => {
			beforeEach( () => {
				const shallowRenderer = TestUtils.createRenderer();
				props.themes = [];
				themesList = React.createElement( ThemesList, props );

				shallowRenderer.render( themesList );
				themesListElement = shallowRenderer.getRenderOutput();
			} );

			test( 'displays the EmptyContent component', () => {
				expect( themesListElement.type.displayName === 'EmptyContent' ).toBeTruthy();
			} );
		} );
	} );
} );
