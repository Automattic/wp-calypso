/**
 * External dependencies
 */
import assert from 'assert';
import ReactDomServer from 'react-dom/server';
import React from 'react';

/**
 * Internal dependencies
 */
import interpolateComponents from '../src/index';

describe( 'interpolate-components', () => {
	const input = React.DOM.input();
	const div = React.DOM.div();
	const link = <a href="#" />;
	const em = <em />;
	const CustomComponentClass = React.createClass( {
		displayName: 'CustomComponentClass',
		render() {
			return <span className="special">{ this.props.intro }{ this.props.children }</span>;
		}
	} );

	describe( 'with default container', () => {
		it( 'should return a react object with a span container', () => {
			const expectedResultString = '<span>test<input/>test</span>';
			const interpolatedResult = interpolateComponents( {
				mixedString: 'test{{input/}}test',
				components: {
					input: input
				}
			} );
			const instance = <span>{ interpolatedResult }</span>;
			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );
		it( 'should allow whitespace in the component placeholder', () => {
			const expectedResultString = '<span>test<input/>test</span>';
			const interpolatedResult = interpolateComponents( {
				mixedString: 'test{{ input /}}test',
				components: {
					input: input
				}
			} );
			const instance = <span>{ interpolatedResult }</span>;
			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );
		it( 'should not add extra span nodes if component is at end of string', () => {
			const expectedResultString = '<span>test<input/></span>';
			const interpolatedResult = interpolateComponents( {
				mixedString: 'test{{ input /}}',
				components: {
					input: input
				}
			} );
			const instance = <span>{ interpolatedResult }</span>;
			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );
		it( 'should not throw when component node is null', () => {
			assert.doesNotThrow( () => {
				interpolateComponents( {
					mixedString: 'test{{input/}}test',
					components: {
						input: null
					},
					throwErrors: true
				} );
			} );
		} );
		it( 'should not throw when component node is not an object', () => {
			assert.doesNotThrow( () => {
				interpolateComponents( {
					mixedString: 'test{{input/}}test{{input2/}}',
					components: {
						input: 'string',
						input2: 123
					},
				} );
			} );
		} );
		it( 'should return original string when component node is not an object', () => {
			const expectedResultString = '<span>test{{input/}}test{{input2/}}</span>';
			const interpolatedResult = interpolateComponents( {
				mixedString: 'test{{input/}}test{{input2/}}',
				components: {
					input: 'string',
					input2: 123
				}
			} );
			const instance = <span>{ interpolatedResult }</span>;
			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );

		describe( 'when allowing thrown errors', () => {
			it( 'should throw when component node is not set', () => {
				assert.throws( () => {
					interpolateComponents( {
						mixedString: 'test{{input/}}',
						components: {
							mismatch: true
						},
						throwErrors: true
					} );
				} );
			} );
			it( 'should throw when component node is undefined', () => {
				assert.throws( () => {
					interpolateComponents( {
						mixedString: 'test{{input/}}',
						components: {
							input: undefined
						},
						throwErrors: true
					} );
				} );
			} );
			it( 'should throw error on invalid cross-nesting', () => {
				assert.throws( () => {
					interpolateComponents( {
						mixedString: '{{link}}a{{em}}b{{/link}}c{{/em}}',
						components: {
							link: link,
							em: em
						},
						throwErrors: true
					} );
				} );
			} );
			it( 'should throw when component is unclosed', () => {
				assert.throws( () => {
					interpolateComponents( {
						mixedString: '{{link}}test',
						components: {
							link: link
						},
						throwErrors: true
					} );
				} );
			} );
		} );

		describe( 'when not allowing thrown errors', () => {
			it( 'should return original string when component node is not set', () => {
				const mixedString = 'test{{input/}}';
				const results = interpolateComponents( {
					mixedString: mixedString,
					components: {
						mismatch: true
					}
				} );
				assert.equal( mixedString, results );
			} );
			it( 'should return original string when component node is undefined', () => {
				const mixedString = 'test{{input/}}';
				const results = interpolateComponents( {
					mixedString: mixedString,
					components: {
						input: undefined
					}
				} );
				assert.equal( mixedString, results );
			} );
			it( 'should return original string on invalid cross-nesting', () => {
				const mixedString = '{{link}}a{{em}}b{{/link}}c{{/em}}';
				const results = interpolateComponents( {
					mixedString: mixedString,
					components: {
						link: link,
						em: em
					}
				} );
				assert.equal( mixedString, results );
			} );
			it( 'should return original string when component is unclosed', () => {
				const mixedString = '{{link}}test';
				const results = interpolateComponents( {
					mixedString: mixedString,
					components: {
						link: link
					}
				} );
				assert.equal( mixedString, results );
			} );
		} );
	} );

	describe( 'with components that wrap content', () => {
		it( 'should wrap the component around the inner contents', () => {
			const expectedResultString = '<span>test <a href="#">link content</a> test</span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: 'test {{link}}link content{{/link}} test',
				components: {
					link: link
				}
			} );
			const instance = <span>{ interpolatedComponent }</span>;

			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );
		it( 'should handle multiple wrapping components', () => {
			const expectedResultString = '<span>test <a href="#">link content</a> <em>link content2</em> test</span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: 'test {{link}}link content{{/link}} {{em}}link content2{{/em}} test',
				components: {
					link: link,
					em: em
				}
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );
		it( 'should handle nested wrapping components', () => {
			const expectedResultString = '<span>test <a href="#">link content <em>emphasis</em></a> test</span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: 'test {{link}}link content {{em}}emphasis{{/em}}{{/link}} test',
				components: {
					link: link,
					em: em
				}
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );
		it( 'should work with custom components', () => {
			const expectedResultString = '<span>here is: <span class="special">baba <span class="special">Hey!willie</span></span></span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: 'here is: {{x}}baba {{y}}willie{{/y}}{{/x}}',
				components: {
					x: <CustomComponentClass />,
					y: <CustomComponentClass intro='Hey!' />
				}
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );
		it( 'should allow repeated component tokens', () => {
			const expectedResultString = '<span><a href="#">baba</a><a href="#">dyado</a></span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: '{{link}}baba{{/link}}{{link}}dyado{{/link}}',
				components: {
					link: link
				}
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );
		it( 'should allow wrapping repeated components', () => {
			const expectedResultString = '<span><div>baba<div>dyado</div></div></span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: '{{div}}baba{{div}}dyado{{/div}}{{/div}}',
				components: {
					div: div
				}
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			assert.equal( expectedResultString, ReactDomServer.renderToStaticMarkup( instance ) );
		} );
	} );
} );
