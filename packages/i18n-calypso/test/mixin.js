/**
 * External dependencies
 */
var React = require( 'react' ),
	createReactClass = require( 'create-react-class' ),
	expect = require( 'chai' ).expect,
	shallow = require( 'enzyme' ).shallow,
	render = require( 'enzyme' ).render;

/**
 * Internal dependencies
 */
var i18n = require( '..' ),
	i18nMixin = i18n.mixin,
	emptyRender = function() { return null; };

describe( 'mixin()', function() {
	it( 'should add its properties to a React Component', function() {
		var mixinComponent = createReactClass( {
			mixins: [ i18nMixin ],
			render: emptyRender
		} );

		var mounted = shallow( React.createElement( mixinComponent ) );

		expect( mounted.instance().translate ).to.be.a( 'function' );
		expect( mounted.instance().moment ).to.be.a( 'function' );
		expect( mounted.instance().numberFormat ).to.be.a( 'function' );
	} );

	it( 'should be able to translate a string inside render', function() {
		i18n.setLocale( {
			'': {
				localeSlug: 'fr'
			},
			'hello': [
				null,
				'bonjour'
			]
		} );

		var mixinComponent = createReactClass( {
			mixins: [ i18nMixin ],
			render: function() {
				return React.createElement( 'p', null, this.translate( 'hello' ) );
			}
		} );

		var renderedResult = render( React.createElement( mixinComponent ) ).text();

		expect( renderedResult ).to.equal( 'bonjour' );
	} );
} );
