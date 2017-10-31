/**
 * External dependencies
 */
var React = require( 'react' ),
	expect = require( 'chai' ).expect,
	mount = require( 'enzyme' ).mount,
	useFakeDom = require( 'react-test-env' ).useFakeDom;

/**
 * Internal dependencies
 */
var localize = require( '..' ).localize,
	emptyRender = function() { return null; };

describe( 'localize()', function() {
	useFakeDom();

	it( 'should be named using the variable name of the composed component', function() {
		class MyComponent extends React.Component {
			render() {
				return emptyRender();
			}
		}

		var LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'Localized(MyComponent)' );
	} );

	it( 'should be named using the displayName of the composed component', function() {
		var MyComponent = () => emptyRender();
		MyComponent.displayName = 'MyComponent';

		var LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'Localized(MyComponent)' );
	} );

	it( 'should be named using the name of the composed function component', function() {
		function MyComponent() {}

		var LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'Localized(MyComponent)' );
	} );

	it( 'should provide translate, moment, and numberFormat props to rendered child', function() {
		var MyComponent = () => emptyRender();
		var LocalizedComponent = localize( MyComponent );

		var mounted = mount( React.createElement( LocalizedComponent ) );
		var props = mounted.find( MyComponent ).props();

		expect( props.translate ).to.be.a( 'function' );
		expect( props.moment ).to.be.a( 'function' );
		expect( props.numberFormat ).to.be.a( 'function' );
	} );
} );
