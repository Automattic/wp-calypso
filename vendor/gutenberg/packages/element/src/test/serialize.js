/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import {
	Component,
	Fragment,
	RawHTML,
} from '../';
import serialize, {
	escapeAmpersand,
	escapeQuotationMark,
	escapeLessThan,
	escapeAttribute,
	escapeHTML,
	hasPrefix,
	renderElement,
	renderNativeComponent,
	renderComponent,
	renderAttributes,
	renderStyle,
} from '../serialize';

function testEscapeAmpersand( implementation ) {
	it( 'should escape ampersand', () => {
		const result = implementation( 'foo & bar &amp; &AMP; baz &#931; &#bad; &#x3A3; &#X3a3; &#xevil;' );

		expect( result ).toBe( 'foo &amp; bar &amp; &AMP; baz &#931; &amp;#bad; &#x3A3; &#X3a3; &amp;#xevil;' );
	} );
}

function testEscapeQuotationMark( implementation ) {
	it( 'should escape quotation mark', () => {
		const result = implementation( '"Be gone!"' );

		expect( result ).toBe( '&quot;Be gone!&quot;' );
	} );
}

function testEscapeLessThan( implementation ) {
	it( 'should escape less than', () => {
		const result = implementation( 'Chicken < Ribs' );

		expect( result ).toBe( 'Chicken &lt; Ribs' );
	} );
}

describe( 'escapeAmpersand', () => {
	testEscapeAmpersand( escapeAmpersand );
} );

describe( 'escapeQuotationMark', () => {
	testEscapeQuotationMark( escapeQuotationMark );
} );

describe( 'escapeLessThan', () => {
	testEscapeLessThan( escapeLessThan );
} );

describe( 'escapeAttribute', () => {
	testEscapeAmpersand( escapeAttribute );
	testEscapeQuotationMark( escapeAttribute );
} );

describe( 'escapeHTML', () => {
	testEscapeAmpersand( escapeHTML );
	testEscapeLessThan( escapeHTML );
} );

describe( 'serialize()', () => {
	it( 'should render with context', () => {
		class Provider extends Component {
			getChildContext() {
				return {
					greeting: 'Hello!',
				};
			}

			render() {
				return this.props.children;
			}
		}

		Provider.childContextTypes = {
			greeting: noop,
		};

		// NOTE: Technically, a component should only receive context if it
		// explicitly defines `contextTypes`. This requirement is ignored in
		// our implementation.

		function FunctionComponent( props, context ) {
			return 'FunctionComponent: ' + context.greeting;
		}

		class ClassComponent extends Component {
			render() {
				return 'ClassComponent: ' + this.context.greeting;
			}
		}

		const result = serialize(
			<Provider>
				<FunctionComponent />
				<ClassComponent />
			</Provider>
		);

		expect( result ).toBe(
			'FunctionComponent: Hello!' +
			'ClassComponent: Hello!'
		);
	} );

	describe( 'empty attributes', () => {
		it( 'should not render a null attribute value', () => {
			const result = serialize( <video src={ undefined } /> );

			expect( result ).toBe( '<video></video>' );
		} );

		it( 'should not render an undefined attribute value', () => {
			const result = serialize( <video src={ null } /> );

			expect( result ).toBe( '<video></video>' );
		} );

		it( 'should an explicitly empty string attribute', () => {
			const result = serialize( <video className="" /> );

			expect( result ).toBe( '<video class=""></video>' );
		} );

		it( 'should not render an empty object style', () => {
			const result = serialize( <video style={ {} } /> );

			expect( result ).toBe( '<video></video>' );
		} );
	} );

	describe( 'boolean attributes', () => {
		it( 'should render elements with false boolean attributes', () => {
			[ false, null, undefined ].forEach( ( controls ) => {
				const result = serialize( <video src="/" controls={ controls } /> );

				expect( result ).toBe( '<video src="/"></video>' );
			} );
		} );

		it( 'should render elements with true boolean attributes', () => {
			[ true, 'true', 'false', '' ].forEach( ( controls ) => {
				const result = serialize( <video src="/" controls={ controls } /> );

				expect( result ).toBe( '<video src="/" controls></video>' );
			} );
		} );

		it( 'should not render non-boolean-attribute with boolean value', () => {
			const result = serialize( <video src controls /> );

			expect( result ).toBe( '<video controls></video>' );
		} );
	} );
} );

describe( 'hasPrefix()', () => {
	it( 'returns true if prefixed', () => {
		const result = hasPrefix( 'Hello World', [ 'baz', 'Hello' ] );

		expect( result ).toBe( true );
	} );

	it( 'returns false if not contains', () => {
		const result = hasPrefix( 'World', [ 'Hello' ] );

		expect( result ).toBe( false );
	} );

	it( 'returns false if contains but not prefix', () => {
		const result = hasPrefix( 'World Hello', [ 'Hello' ] );

		expect( result ).toBe( false );
	} );
} );

describe( 'renderElement()', () => {
	it( 'renders empty content as empty string', () => {
		[ null, undefined, false ].forEach( ( element ) => {
			const result = renderElement( element );

			expect( result ).toBe( '' );
		} );
	} );

	it( 'renders an array of mixed content', () => {
		const result = renderElement( [ 'hello', <div key="div" /> ] );

		expect( result ).toBe( 'hello<div></div>' );
	} );

	it( 'renders escaped string element', () => {
		const result = renderElement( 'hello & world &amp; friends <img/>' );

		expect( result ).toBe( 'hello &amp; world &amp; friends &lt;img/>' );
	} );

	it( 'renders numeric element as string', () => {
		const result = renderElement( 10 );

		expect( result ).toBe( '10' );
	} );

	it( 'renders native component', () => {
		const result = renderElement( <div className="greeting">Hello</div> );

		expect( result ).toBe( '<div class="greeting">Hello</div>' );
	} );

	it( 'renders function component', () => {
		function Greeting() {
			return <div className="greeting">Hello</div>;
		}

		const result = renderElement( <Greeting /> );

		expect( result ).toBe( '<div class="greeting">Hello</div>' );
	} );

	it( 'renders class component', () => {
		class Greeting extends Component {
			render() {
				return <div className="greeting">Hello</div>;
			}
		}

		const result = renderElement( <Greeting /> );

		expect( result ).toBe( '<div class="greeting">Hello</div>' );
	} );

	it( 'renders empty string for indeterminite types', () => {
		const result = renderElement( {} );

		expect( result ).toBe( '' );
	} );

	it( 'renders Fragment as its inner children', () => {
		const result = renderElement( <Fragment>Hello</Fragment> );

		expect( result ).toBe( 'Hello' );
	} );

	it( 'renders Fragment with undefined children', () => {
		const result = renderElement( <Fragment /> );

		expect( result ).toBe( '' );
	} );

	it( 'renders RawHTML as its unescaped children', () => {
		const result = renderElement( <RawHTML>{ '<img/>' }</RawHTML> );

		expect( result ).toBe( '<img/>' );
	} );

	it( 'renders RawHTML with wrapper if props passed', () => {
		const result = renderElement( <RawHTML className="foo">{ '<img/>' }</RawHTML> );

		expect( result ).toBe( '<div class="foo"><img/></div>' );
	} );

	it( 'renders RawHTML with empty children as empty string', () => {
		const result = renderElement( <RawHTML /> );

		expect( result ).toBe( '' );
	} );

	it( 'renders RawHTML with wrapper and empty children', () => {
		const result = renderElement( <RawHTML className="foo" /> );

		expect( result ).toBe( '<div class="foo"></div>' );
	} );
} );

describe( 'renderNativeComponent()', () => {
	describe( 'textarea', () => {
		it( 'should render textarea value as its content', () => {
			const result = renderNativeComponent( 'textarea', { value: 'Hello', children: [] } );

			expect( result ).toBe( '<textarea>Hello</textarea>' );
		} );

		it( 'should render textarea children as its content', () => {
			const result = renderNativeComponent( 'textarea', { children: [ 'Hello' ] } );

			expect( result ).toBe( '<textarea>Hello</textarea>' );
		} );
	} );

	describe( 'escaping', () => {
		it( 'should escape children', () => {
			const result = renderNativeComponent( 'div', { children: [ '<img/>' ] } );

			expect( result ).toBe( '<div>&lt;img/></div>' );
		} );

		it( 'should not render invalid dangerouslySetInnerHTML', () => {
			const result = renderNativeComponent( 'div', { dangerouslySetInnerHTML: { __html: undefined } } );

			expect( result ).toBe( '<div></div>' );
		} );

		it( 'should not escape children with dangerouslySetInnerHTML', () => {
			const result = renderNativeComponent( 'div', { dangerouslySetInnerHTML: { __html: '<img/>' } } );

			expect( result ).toBe( '<div><img/></div>' );
		} );
	} );

	describe( 'self-closing', () => {
		it( 'should render self-closing elements', () => {
			const result = renderNativeComponent( 'img', { src: 'foo.png' } );

			expect( result ).toBe( '<img src="foo.png"/>' );
		} );

		it( 'should ignore self-closing elements children', () => {
			const result = renderNativeComponent( 'img', { src: 'foo.png', children: [ 'Surprise!' ] } );

			expect( result ).toBe( '<img src="foo.png"/>' );
		} );
	} );

	describe( 'with children', () => {
		it( 'should render single literal child', () => {
			const result = renderNativeComponent( 'div', { children: 'Hello' } );

			expect( result ).toBe( '<div>Hello</div>' );
		} );

		it( 'should render array of children', () => {
			const result = renderNativeComponent( 'div', { children: [
				'Hello ',
				<Fragment key="toWhom">World</Fragment>,
			] } );

			expect( result ).toBe( '<div>Hello World</div>' );
		} );
	} );
} );

describe( 'renderComponent()', () => {
	it( 'calls constructor and componentWillMount', () => {
		class Example extends Component {
			constructor() {
				super( ...arguments );

				this.constructed = 'constructed';
			}

			componentWillMount() {
				this.willMounted = 'willMounted';
			}

			render() {
				return this.constructed + this.willMounted;
			}
		}

		const result = renderComponent( Example, {} );

		expect( console ).toHaveWarned();
		expect( result ).toBe( 'constructedwillMounted' );
	} );

	it( 'does not call componentDidMount', () => {
		class Example extends Component {
			constructor() {
				super( ...arguments );

				this.state = {};
			}

			componentDidMount() {
				this.setState( { didMounted: 'didMounted' } );
			}

			render() {
				return this.state.didMounted;
			}
		}

		const result = renderComponent( Example, {} );

		expect( result ).toBe( '' );
	} );
} );

describe( 'renderAttributes()', () => {
	describe( 'boolean attributes', () => {
		it( 'should return boolean attributes false as omitted', () => {
			const result = renderAttributes( { controls: false } );

			expect( result ).toBe( '' );
		} );

		it( 'should return boolean attributes non-false as present', () => {
			[ true, 'true', 'false', '' ].forEach( ( controls ) => {
				const result = renderAttributes( { controls } );

				expect( result ).toBe( ' controls' );
			} );
		} );

		it( 'should consider normalized boolean attribute name', () => {
			const result = renderAttributes( { allowFullscreen: true } );

			expect( result ).toBe( ' allowfullscreen' );
		} );
	} );

	describe( 'prefixed attributes', () => {
		it( 'should not render if nullish', () => {
			[ null, undefined ].forEach( ( value ) => {
				const result = renderAttributes( { 'data-foo': value } );

				expect( result ).toBe( '' );
			} );
		} );

		it( 'should return in its string form unmodified', () => {
			let result = renderAttributes( {
				'aria-hidden': '',
			} );

			expect( result ).toBe( ' aria-hidden=""' );

			result = renderAttributes( {
				'aria-hidden': true,
			} );

			expect( result ).toBe( ' aria-hidden="true"' );

			result = renderAttributes( {
				'aria-hidden': false,
			} );

			expect( result ).toBe( ' aria-hidden="false"' );
		} );
	} );

	describe( 'normalized attribute names', () => {
		it( 'should return with normal attribute names', () => {
			const result = renderAttributes( {
				htmlFor: 'foo',
				className: 'bar',
				contentEditable: true,
			} );

			expect( result ).toBe( ' for="foo" class="bar" contenteditable="true"' );
		} );
	} );

	describe( 'string escaping', () => {
		it( 'should escape string attributes', () => {
			const result = renderAttributes( {
				style: {
					background: 'url("foo.png")',
				},
				href: '/index.php?foo=bar&qux=<"scary">',
			} );

			expect( result ).toBe( ' style="background:url(&quot;foo.png&quot;)" href="/index.php?foo=bar&amp;qux=<&quot;scary&quot;>"' );
		} );

		it( 'should render numeric attributes', () => {
			const result = renderAttributes( {
				size: 10,
			} );

			expect( result ).toBe( ' size="10"' );
		} );
	} );

	describe( 'ignored attributes', () => {
		it( 'does not render nullish attributes', () => {
			const result = renderAttributes( {
				className: null,
				htmlFor: undefined,
			} );

			expect( result ).toBe( '' );
		} );

		it( 'does not render attributes of invalid types', () => {
			const result = renderAttributes( {
				onClick: () => {},
				className: [],
			} );

			expect( result ).toBe( '' );
		} );

		it( 'does not render internal attributes', () => {
			const result = renderAttributes( {
				key: 'foo',
				children: [ 'hello' ],
			} );

			expect( result ).toBe( '' );
		} );
	} );
} );

describe( 'renderStyle()', () => {
	it( 'should return undefined if empty', () => {
		const result = renderStyle( {} );

		expect( result ).toBe( undefined );
	} );

	it( 'should render without trailing semi-colon', () => {
		const result = renderStyle( {
			color: 'red',
		} );

		expect( result ).toBe( 'color:red' );
	} );

	it( 'should not render nullish value', () => {
		const result = renderStyle( {
			border: null,
			backgroundColor: undefined,
			color: 'red',
		} );

		expect( result ).toBe( 'color:red' );
	} );

	it( 'should render a semi-colon delimited set', () => {
		const result = renderStyle( {
			color: 'red',
			border: '1px dotted green',
		} );

		expect( result ).toBe( 'color:red;border:1px dotted green' );
	} );

	it( 'should kebab-case style properties', () => {
		const result = renderStyle( {
			color: 'red',
			backgroundColor: 'green',
		} );

		expect( result ).toBe( 'color:red;background-color:green' );
	} );

	it( 'should not kebab-case custom properties', () => {
		const result = renderStyle( {
			'--myBackgroundColor': 'palegoldenrod',
		} );

		expect( result ).toBe( '--myBackgroundColor:palegoldenrod' );
	} );

	it( 'should -kebab-case style properties with a vendor prefix', () => {
		const result = renderStyle( {
			msTransform: 'none',
			OTransform: 'none',
			MozTransform: 'none',
			WebkitTransform: 'none',
		} );

		expect( result ).toBe( '-ms-transform:none;-o-transform:none;-moz-transform:none;-webkit-transform:none' );
	} );

	describe( 'value unit', () => {
		it( 'should not render zero unit', () => {
			const result = renderStyle( {
				borderWidth: 0,
			} );

			expect( result ).toBe( 'border-width:0' );
		} );

		it( 'should render numeric units', () => {
			const result = renderStyle( {
				borderWidth: 10,
			} );

			expect( result ).toBe( 'border-width:10px' );
		} );

		it( 'should not render numeric units for unitless properties', () => {
			const result = renderStyle( {
				order: 10,
			} );

			expect( result ).toBe( 'order:10' );
		} );
	} );
} );
