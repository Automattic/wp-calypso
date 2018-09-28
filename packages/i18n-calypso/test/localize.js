/**
 * External dependencies
 */
let React = require( 'react' ),
	setupEnzymeAdapter = require( 'enzyme-adapter-react-helper' ),
	expect = require( 'chai' ).expect,
	shallow = require( 'enzyme' ).shallow;

/**
 * Internal dependencies
 */
let localize = require( '..' ).localize,
	emptyRender = function() { return null; };

describe( 'localize()', function() {
	setupEnzymeAdapter();

	it( 'should be named using the variable name of the composed component', function() {
		class MyComponent extends React.Component {
			render() {
				return emptyRender();
			}
		}

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'Localized(MyComponent)' );
	} );

	it( 'should be named using the displayName of the composed component', function() {
		const MyComponent = () => emptyRender();
		MyComponent.displayName = 'MyComponent';

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'Localized(MyComponent)' );
	} );

	it( 'should be named using the name of the composed function component', function() {
		function MyComponent() {}

		const LocalizedComponent = localize( MyComponent );

		expect( LocalizedComponent.displayName ).to.equal( 'Localized(MyComponent)' );
	} );

	it( 'should provide translate, moment, and numberFormat props to rendered child', function() {
		const MyComponent = () => emptyRender();
		const LocalizedComponent = localize( MyComponent );

		const mounted = shallow( React.createElement( LocalizedComponent ) );
		const props = mounted.find( MyComponent ).props();

		expect( props.translate ).to.be.a( 'function' );
		expect( props.moment ).to.be.a( 'function' );
		expect( props.numberFormat ).to.be.a( 'function' );
	} );
} );
