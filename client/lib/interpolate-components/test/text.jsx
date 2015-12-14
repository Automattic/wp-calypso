/**
 * External dependencies
 */
var assert = require( 'assert' ),
	ReactDomServer = require( 'react-dom/server' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var warn = require( 'lib/warn' ),
	interpolateComponents = require( 'lib/interpolate-components' );

/**
 * Pass in a react-generated html string to remove react-specific attributes
 * to make it easier to compare to expected html structure
 * @param  {string} string React-generated html string
 * @return {string}        html with react attributes removed
 */
function stripReactAttributes( string ) {
	return string.replace( /\sdata\-(reactid|react\-checksum)\=\"[^\"]+\"/g, '' );
}

describe( 'interpolate-components', function() {
	var input = React.DOM.input(),
		div = React.DOM.div(),
		link = <a href="#" />,
		em = <em />,
		CustomComponentClass = React.createClass( {
			displayName: 'CustomComponentClass',
			render: function() {
				return <span className="special">{ this.props.intro }{ this.props.children }</span>;
			}
		} );

	beforeEach( function() {
		warn.reset();
	} );

	describe( 'with default container', function() {
		it( 'should return a react object with a span container', function() {
			var expectedResultString = '<span><span>test</span><input/><span>test</span></span>',
				translatedComponent = interpolateComponents( {
					translation: 'test{{input/}}test',
					components: {
						input: input
					}
				} ),
				instance = <span>{ translatedComponent }</span>;

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToString( instance ) ) );
		} );
		it( 'should allow whitespace in the component placeholder', function() {
			var expectedResultString = '<span><span>test</span><input/><span>test</span></span>',
				translatedComponent = interpolateComponents( {
					translation: 'test{{ input /}}test',
					components: {
						input: input
					}
				} ),
				instance = <span>{ translatedComponent }</span>;

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToString( instance ) ) );
		} );
		it( 'should not add extra span nodes if component is at end of string', function() {
			var expectedResultString = '<span><span>test</span><input/></span>',
				translatedComponent = interpolateComponents( {
					translation: 'test{{ input /}}',
					components: {
						input: input
					}
				} ),
				instance = <span>{ translatedComponent }</span>;

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToString( instance ) ) );
		} );
		it( 'should not throw when component node is null', function() {
			assert.doesNotThrow( function() {
				interpolateComponents( {
					translation: 'test{{input/}}test',
					components: {
						input: null
					},
					throwErrors: true
				} );
			} );
		} );
		it( 'should warn when component node is not an object', function() {
			interpolateComponents( {
					translation: 'test{{input/}}test{{input2/}}',
				components: {
					input: 'string',
					input2: 123
				}
			} );
			assert( warn.calledTwice );
		} );

		describe( 'when allowing thrown errors', function() {
			it( 'should throw when component node is not set', function() {
				assert.throws( function() {
					interpolateComponents( {
						translation: 'test{{input/}}',
						components: {
							mismatch: true
						},
						throwErrors: true
					} );
				} );
			} );
			it( 'should throw when component node is undefined', function() {
				assert.throws( function() {
					interpolateComponents( {
						translation: 'test{{input/}}',
						components: {
							input: undefined
						},
						throwErrors: true
					} );
				} );
			} );
			it( 'should throw error on invalid cross-nesting', function() {
				assert.throws( function() {
					interpolateComponents( {
						translation: '{{link}}a{{em}}b{{/link}}c{{/em}}',
						components: {
							link: link,
							em: em
						},
						throwErrors: true
					} );
				} );
			} );
			it( 'should throw when component is unclosed', function() {
				assert.throws( function() {
					interpolateComponents( {
						translation: '{{link}}test',
						components: {
							link: link
						},
						throwErrors: true
					} );
				} );
			} );
		} );

		describe( 'when not allowing thrown errors', function() {
			it( 'should return original string when component node is not set', function() {
				var translation = 'test{{input/}}',
					results = interpolateComponents( {
						translation: translation,
						components: {
							mismatch: true
						}
					} );
				assert.equal( translation, results );
			} );
			it( 'should return original string when component node is undefined', function() {
				var translation = 'test{{input/}}',
					results = interpolateComponents( {
						translation: translation,
						components: {
							input: undefined
						}
					} );
				assert.equal( translation, results );
			} );
			it( 'should return original string on invalid cross-nesting', function() {
				var translation = '{{link}}a{{em}}b{{/link}}c{{/em}}',
					results = interpolateComponents( {
						translation: translation,
						components: {
							link: link,
							em: em
						}
					} );
				assert.equal( translation, results );
			} );
			it( 'should return original string when component is unclosed', function() {
				var translation = '{{link}}test',
					results = interpolateComponents( {
						translation: translation,
						components: {
							link: link
						}
					} );
				assert.equal( translation, results );
			} );
		} );
	} );

	describe( 'with components that wrap content', function() {
		it( 'should wrap the component around the inner contents', function() {
			var expectedResultString = '<span><span>test </span><a href="#">link content</a><span> test</span></span>',
				translatedComponent = interpolateComponents( {
					translation: 'test {{link}}link content{{/link}} test',
					components: {
						link: link
					}
				} ),
				instance = <span>{ translatedComponent }</span>;

			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToString( instance ) ) );
		} );
		it( 'should handle multiple wrapping components', function() {
			var expectedResultString = '<span><span>test </span><a href="#">link content</a><span> </span><em>link content2</em><span> test</span></span>',
				translatedComponent = interpolateComponents( {
					translation: 'test {{link}}link content{{/link}} {{em}}link content2{{/em}} test',
					components: {
						link: link,
						em: em
					}
				} ),
				instance = <span>{ translatedComponent }</span>;
			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToString( instance ) ) );
		} );
		it( 'should handle nested wrapping components', function() {
			var expectedResultString = '<span><span>test </span><a href="#"><span>link content </span><em>emphasis</em></a><span> test</span></span>',
				translatedComponent = interpolateComponents( {
					translation: 'test {{link}}link content {{em}}emphasis{{/em}}{{/link}} test',
					components: {
						link: link,
						em: em
					}
				} ),
				instance = <span>{ translatedComponent }</span>;
			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToString( instance ) ) );
		} );
		it( 'should work with custom components', function() {
			var expectedResultString = '<span><span>here is: </span><span class="special"><span>baba </span><span class="special"><span>Hey!</span><span>willie</span></span></span></span>',
				translatedComponent = interpolateComponents( {
					translation: 'here is: {{x}}baba {{y}}willie{{/y}}{{/x}}',
					components: {
						x: <CustomComponentClass />,
						y: <CustomComponentClass intro='Hey!' />
					}
				} ),
				instance = <span>{ translatedComponent }</span>;
			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToString( instance ) ) );
		} );
		it( 'should allow repeated component tokens', function() {
			var expectedResultString = '<span><a href="#">baba</a><a href="#">dyado</a></span>',
				translatedComponent = interpolateComponents( {
					translation: '{{link}}baba{{/link}}{{link}}dyado{{/link}}',
					components: {
						link: link
					}
				} ),
				instance = <span>{ translatedComponent }</span>;
			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToString( instance ) ) );
		} );
		it( 'should allow wrapping repeated components', function() {
			var expectedResultString = '<span><div><span>baba</span><div>dyado</div></div></span>',
				translatedComponent = interpolateComponents( {
					translation: '{{div}}baba{{div}}dyado{{/div}}{{/div}}',
					components: {
						div: div
					}
				} ),
				instance = <span>{ translatedComponent }</span>;
			assert.equal( expectedResultString, stripReactAttributes( ReactDomServer.renderToString( instance ) ) );
		} );
	} );
} );
