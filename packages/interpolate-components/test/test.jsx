import ReactDomServer from 'react-dom/server';
import interpolateComponents from '../src';

describe( 'interpolate-components', () => {
	const input = <input />;
	const div = <div />;
	const link = <a href="#" />; // eslint-disable-line jsx-a11y/anchor-is-valid
	const em = <em />;
	const CustomComponentClass = ( { children, intro } ) => (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<span className="special">
			{ intro }
			{ children }
		</span>
	);

	describe( 'with default container', () => {
		it( 'should return a react object with a span container', () => {
			const expectedResultString = '<span>test<input/>test</span>';
			const interpolatedResult = interpolateComponents( {
				mixedString: 'test{{input/}}test',
				components: { input },
			} );
			const instance = <span>{ interpolatedResult }</span>;
			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );

		it( 'should allow whitespace in the component placeholder', () => {
			const expectedResultString = '<span>test<input/>test</span>';
			const interpolatedResult = interpolateComponents( {
				mixedString: 'test{{ input /}}test',
				components: { input },
			} );
			const instance = <span>{ interpolatedResult }</span>;
			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );

		it( 'should not add extra span nodes if component is at end of string', () => {
			const expectedResultString = '<span>test<input/></span>';
			const interpolatedResult = interpolateComponents( {
				mixedString: 'test{{ input /}}',
				components: { input },
			} );
			const instance = <span>{ interpolatedResult }</span>;
			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );

		it( 'should not throw when component node is null', () => {
			const expectedResultString = 'testtest';
			const interpolatedResult = interpolateComponents( {
				mixedString: 'test{{input/}}test',
				components: {
					input: null,
				},
				throwErrors: true,
			} );
			expect( ReactDomServer.renderToStaticMarkup( interpolatedResult ) ).toBe(
				expectedResultString
			);
		} );

		it( 'should return original string when component node is not an object', () => {
			const expectedResultString = '<span>test{{input/}}test{{input2/}}</span>';
			const interpolatedResult = interpolateComponents( {
				mixedString: 'test{{input/}}test{{input2/}}',
				components: {
					input: 'string',
					input2: 123,
				},
			} );
			const instance = <span>{ interpolatedResult }</span>;
			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );

		describe( 'when allowing thrown errors', () => {
			it( 'should throw when component node is not set', () => {
				expect( () => {
					interpolateComponents( {
						mixedString: 'test{{input/}}',
						components: {
							mismatch: true,
						},
						throwErrors: true,
					} );
				} ).toThrow();
			} );

			it( 'should throw when component node is undefined', () => {
				expect( () => {
					interpolateComponents( {
						mixedString: 'test{{input/}}',
						components: {
							input: undefined,
						},
						throwErrors: true,
					} );
				} ).toThrow();
			} );

			it( 'should throw error on invalid cross-nesting', () => {
				expect( () => {
					interpolateComponents( {
						mixedString: '{{link}}a{{em}}b{{/link}}c{{/em}}',
						components: { link, em },
						throwErrors: true,
					} );
				} ).toThrow();
			} );

			it( 'should throw when component is unclosed', () => {
				expect( () => {
					interpolateComponents( {
						mixedString: '{{link}}test',
						components: { link },
						throwErrors: true,
					} );
				} ).toThrow();
			} );
		} );

		describe( 'when not allowing to throw errors', () => {
			it( 'should return original string when component node is not set', () => {
				const mixedString = 'test{{input/}}';
				const results = interpolateComponents( {
					mixedString,
					components: {
						mismatch: true,
					},
				} );
				expect( results ).toBe( mixedString );
			} );

			it( 'should return original string when component node is undefined', () => {
				const mixedString = 'test{{input/}}';
				const results = interpolateComponents( {
					mixedString,
					components: {
						input: undefined,
					},
				} );
				expect( results ).toBe( mixedString );
			} );

			it( 'should return original string on invalid cross-nesting', () => {
				const mixedString = '{{link}}a{{em}}b{{/link}}c{{/em}}';
				const results = interpolateComponents( {
					mixedString,
					components: { link, em },
				} );
				expect( results ).toBe( mixedString );
			} );

			it( 'should return original string when component is unclosed', () => {
				const mixedString = '{{link}}test';
				const results = interpolateComponents( {
					mixedString,
					components: { link },
				} );
				expect( results ).toBe( mixedString );
			} );
		} );
	} );

	describe( 'with components that wrap content', () => {
		it( 'should wrap the component around the inner contents', () => {
			const expectedResultString = '<span>test <a href="#">link content</a> test</span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: 'test {{link}}link content{{/link}} test',
				components: { link },
			} );
			const instance = <span>{ interpolatedComponent }</span>;

			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );

		it( 'should handle multiple wrapping components', () => {
			const expectedResultString =
				'<span>test <a href="#">link content</a> <em>link content2</em> test</span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: 'test {{link}}link content{{/link}} {{em}}link content2{{/em}} test',
				components: { link, em },
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );

		it( 'should handle nested wrapping components', () => {
			const expectedResultString =
				'<span>test <a href="#">link content <em>emphasis</em></a> test</span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: 'test {{link}}link content {{em}}emphasis{{/em}}{{/link}} test',
				components: { link, em },
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );

		it( 'should work with custom components', () => {
			const expectedResultString =
				'<span>here is: <span class="special">baba <span class="special">Hey!willie</span></span></span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: 'here is: {{x}}baba {{y}}willie{{/y}}{{/x}}',
				components: {
					x: <CustomComponentClass />,
					y: <CustomComponentClass intro="Hey!" />,
				},
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );

		it( 'should allow repeated component tokens', () => {
			const expectedResultString = '<span><a href="#">baba</a><a href="#">dyado</a></span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: '{{link}}baba{{/link}}{{link}}dyado{{/link}}',
				components: { link },
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );

		it( 'should allow wrapping repeated components', () => {
			const expectedResultString = '<span><div>baba<div>dyado</div></div></span>';
			const interpolatedComponent = interpolateComponents( {
				mixedString: '{{div}}baba{{div}}dyado{{/div}}{{/div}}',
				components: { div },
			} );
			const instance = <span>{ interpolatedComponent }</span>;
			expect( ReactDomServer.renderToStaticMarkup( instance ) ).toBe( expectedResultString );
		} );
	} );
} );
