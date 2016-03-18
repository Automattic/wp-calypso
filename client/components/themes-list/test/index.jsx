/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'ThemesList', function() {
	let React, TestUtils, ThemesList;
	useSandbox();
	this.timeout( 10 * 1000 );

	useMockery( mockery => {
		React = require( 'react' );
		TestUtils = require( 'react-addons-test-utils' ),

		mockery.registerMock( './more-button', React.createClass( { render: () =>  <div/> } ) );
		ThemesList = require( '../' );
	} );

	after( function() {
		delete ThemesList.prototype.__reactAutoBindMap.translate;
	} );

	beforeEach( function() {
		ThemesList.prototype.__reactAutoBindMap.translate = this.sandbox.stub().returnsArg( 0 );

		this.props = {
			themes: [
				{
					name: 'kubrick',
					screenshot: '/theme/kubrick/screenshot.png',
				},
				{
					name: 'picard',
					screenshot: '/theme/picard/screenshot.png',
				}
			],
			lastPage: true,
			loading: false,
			fetchNextPage: () => {},
			getButtonOptions: () => {},
		};

		this.themesList = React.createElement( ThemesList, this.props );
	} );

	describe( 'propTypes', function() {
		it( 'specifies the required propType', function() {
			assert( this.themesList.type.propTypes.themes, 'themes propType missing' );
		} );
	} );

	describe( 'rendering', function() {
		beforeEach( function() {
			var shallowRenderer = TestUtils.createRenderer();

			shallowRenderer.render( this.themesList );
			this.themesListElement = shallowRenderer.getRenderOutput();
		} );

		it( 'should render a div with a className of "themes-list"', function() {
			assert( this.themesListElement, 'element does not exist' );
			assert( this.themesListElement.props.className === 'themes-list', 'className does not equal "themes-list"' );
		} );

		context( 'when no themes are found', function() {
			beforeEach( function() {
				var shallowRenderer = TestUtils.createRenderer();
				this.props.themes = [];
				this.themesList = React.createElement( ThemesList, this.props );

				shallowRenderer.render( this.themesList );
				this.themesListElement = shallowRenderer.getRenderOutput();
			} );

			it( 'displays the EmptyContent component', function() {
				assert( this.themesListElement.type.displayName === 'EmptyContent', 'No EmptyContent' );
			} );

		} );
	} );

} );
