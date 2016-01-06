/**
 * External dependencies
 */
var assert = require( 'chai' ).assert,
	React = require( 'react' ),
	TestUtils = require( 'react-addons-test-utils' ),
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' );

function mockComponent( displayName ) {
	return React.createClass( {
		displayName,
		render: () => { return <div/> }
	} );
};

describe( 'ThemesList', function() {
	before( function() {
		mockery.registerMock( './more-button', mockComponent() );

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
			fetchNextPage: () => {},
			getButtonOptions: () => {},
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
