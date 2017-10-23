/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';
import { noop } from 'lodash';
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

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
			assert( themesList.type.propTypes.themes, 'themes propType missing' );
		} );
	} );

	describe( 'rendering', () => {
		beforeEach( () => {
			const renderer = new ShallowRenderer();

			renderer.render( themesList );
			themesListElement = renderer.getRenderOutput();
		} );

		test( 'should render a div with a className of "themes-list"', () => {
			assert( themesListElement, 'element does not exist' );
			assert(
				themesListElement.props.className === 'themes-list',
				'className does not equal "themes-list"'
			);
		} );

		describe( 'when no themes are found', () => {
			beforeEach( () => {
				const renderer = new ShallowRenderer();
				props.themes = [];
				themesList = React.createElement( ThemesList, props );

				renderer.render( themesList );
				themesListElement = renderer.getRenderOutput();
			} );

			test( 'displays the EmptyContent component', () => {
				assert( themesListElement.type.displayName === 'EmptyContent', 'No EmptyContent' );
			} );
		} );
	} );
} );
