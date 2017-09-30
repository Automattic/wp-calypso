/** @jest-environment jsdom */
jest.mock( 'components/pulsing-dot', () => require( 'components/empty-component' ) );
jest.mock( 'components/theme/more-button', () => require( 'components/empty-component' ) );

/**
 * External dependencies
 */
import { assert } from 'chai';
import { noop } from 'lodash';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import { ThemesList } from '../';

describe( 'ThemesList', function() {
	let props, themesList, themesListElement;

	beforeEach( function() {
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
				}
			],
			lastPage: true,
			loading: false,
			fetchNextPage: noop,
			getButtonOptions: noop,
			onScreenshotClick: noop,
			translate: x => x // Mock translate()
		};

		themesList = React.createElement( ThemesList, props );
	} );

	describe( 'propTypes', function() {
		it( 'specifies the required propType', function() {
			assert( themesList.type.propTypes.themes, 'themes propType missing' );
		} );
	} );

	describe( 'rendering', function() {
		beforeEach( function() {
			const shallowRenderer = TestUtils.createRenderer();

			shallowRenderer.render( themesList );
			themesListElement = shallowRenderer.getRenderOutput();
		} );

		it( 'should render a div with a className of "themes-list"', function() {
			assert( themesListElement, 'element does not exist' );
			assert( themesListElement.props.className === 'themes-list', 'className does not equal "themes-list"' );
		} );

		context( 'when no themes are found', function() {
			beforeEach( function() {
				const shallowRenderer = TestUtils.createRenderer();
				props.themes = [];
				themesList = React.createElement( ThemesList, props );

				shallowRenderer.render( themesList );
				themesListElement = shallowRenderer.getRenderOutput();
			} );

			it( 'displays the EmptyContent component', function() {
				assert( themesListElement.type.displayName === 'EmptyContent', 'No EmptyContent' );
			} );
		} );
	} );
} );
