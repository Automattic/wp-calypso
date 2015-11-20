/**
 * External dependencies
 */
var assert = require( 'chai' ).assert,
	React = require( 'react/addons' ),
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' );

var MockMoreButton = React.createClass( {
	render: function() {
		return <div/>;
	}
} );

describe( 'ThemesList', function() {
	before( function() {
		mockery.registerMock( './more-button', MockMoreButton);

		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		this.ThemesList = require( '../' );
		this.ThemesList.prototype.__reactAutoBindMap.translate = sinon.stub().returnsArg( 0 );
	} );

	after( function() {
		delete this.ThemesList.prototype.__reactAutoBindMap.translate;
	} );

	beforeEach( function() {
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
			fetchNextPage: function() {},
		};

		this.themesList = React.createElement( this.ThemesList, this.props );
	} );

	describe( 'propTypes', function() {
		it( 'specifies the required propType', function() {
			assert( this.themesList.type.propTypes.themes, 'themes propType missing' );
		} );
	} );

	describe( 'rendering', function() {
		beforeEach( function() {
			var shallowRenderer = React.addons.TestUtils.createRenderer();

			shallowRenderer.render( this.themesList );
			this.themesListElement = shallowRenderer.getRenderOutput();
		} );

		it( 'should render an InfiniteList with a className of "themes-list"', function() {
			assert( this.themesListElement, 'element does not exist' );
			assert( this.themesListElement.type.displayName === 'InfiniteList', 'element type does not equal "InfiniteList"' );
			assert( this.themesListElement.props.className === 'themes-list', 'className does not equal "themes-list"' );
		} );

		it( 'should have an item for each theme', function() {
			assert( this.themesListElement.props.items.length === this.props.themes.length, 'items count is different from themes count' );
		} );

		context( 'when no themes are found', function() {
			beforeEach( function() {
				var shallowRenderer = React.addons.TestUtils.createRenderer();
				this.props.themes = [];
				this.themesList = React.createElement( this.ThemesList, this.props );

				shallowRenderer.render( this.themesList );
				this.themesListElement = shallowRenderer.getRenderOutput();
			} );

			it( 'displays the EmptyContent component', function() {
				assert( this.themesListElement.type.displayName === 'EmptyContent', 'No EmptyContent' );
			} );

		} );
	} );

} );
