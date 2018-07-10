/**
 * External dependencies
 */
import { shallow, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import {
	Component,
	createElement,
	createHigherOrderComponent,
	concatChildren,
	renderToString,
	switchChildrenNodeName,
	RawHTML,
	pure,
} from '../';

describe( 'element', () => {
	describe( 'renderToString', () => {
		it( 'should return an empty string for booleans/null/undefined values', () => {
			expect( renderToString() ).toBe( '' );
			expect( renderToString( false ) ).toBe( '' );
			expect( renderToString( true ) ).toBe( '' );
			expect( renderToString( null ) ).toBe( '' );
		} );

		it( 'should return a string 0', () => {
			expect( renderToString( 0 ) ).toBe( '0' );
		} );

		it( 'should return a string 12345', () => {
			expect( renderToString( 12345 ) ).toBe( '12345' );
		} );

		it( 'should return a string verbatim', () => {
			expect( renderToString( 'Zucchini' ) ).toBe( 'Zucchini' );
		} );

		it( 'should return a string from an array', () => {
			expect( renderToString( [
				'Zucchini ',
				createElement( 'em', null, 'is a' ),
				' summer squash',
			] ) ).toBe( 'Zucchini <em>is a</em> summer squash' );
		} );

		it( 'should return a string from an element', () => {
			expect( renderToString(
				createElement( 'strong', null, 'Courgette' )
			) ).toBe( '<strong>Courgette</strong>' );
		} );

		it( 'should escape attributes and html', () => {
			const result = renderToString( createElement( 'a', {
				href: '/index.php?foo=bar&qux=<"scary">',
				style: {
					backgroundColor: 'red',
				},
			}, '<"WordPress" & Friends>' ) );

			expect( result ).toBe(
				'<a href="/index.php?foo=bar&amp;qux=<&quot;scary&quot;>" style="background-color:red">' +
				'&lt;"WordPress" &amp; Friends>' +
				'</a>'
			);
		} );

		it( 'strips raw html wrapper', () => {
			const html = '<p>So scary!</p>';

			expect( renderToString(
				<RawHTML>{ html }</RawHTML>,
			) ).toBe( html );
		} );
	} );

	describe( 'concatChildren', () => {
		it( 'should return an empty array for undefined children', () => {
			expect( concatChildren() ).toEqual( [] );
		} );

		it( 'should concat the string arrays', () => {
			expect( concatChildren( [ 'a' ], 'b' ) ).toEqual( [ 'a', 'b' ] );
		} );

		it( 'should concat the object arrays and rewrite keys', () => {
			const concat = concatChildren(
				[ createElement( 'strong', {}, 'Courgette' ) ],
				createElement( 'strong', {}, 'Concombre' )
			);
			expect( concat ).toHaveLength( 2 );
			expect( concat[ 0 ].key ).toBe( '0,0' );
			expect( concat[ 1 ].key ).toBe( '1,0' );
		} );
	} );

	describe( 'switchChildrenNodeName', () => {
		it( 'should return undefined for undefined children', () => {
			expect( switchChildrenNodeName() ).toBeUndefined();
		} );

		it( 'should switch strings', () => {
			const children = switchChildrenNodeName( [ 'a', 'b' ], 'strong' );
			expect( children ).toHaveLength( 2 );
			expect( children[ 0 ].type ).toBe( 'strong' );
			expect( children[ 0 ].props.children ).toBe( 'a' );
			expect( children[ 1 ].type ).toBe( 'strong' );
			expect( children[ 1 ].props.children ).toBe( 'b' );
		} );

		it( 'should switch elements', () => {
			const children = switchChildrenNodeName( [
				createElement( 'strong', { align: 'left' }, 'Courgette' ),
				createElement( 'strong', {}, 'Concombre' ),
			], 'em' );
			expect( children ).toHaveLength( 2 );
			expect( children[ 0 ].type ).toBe( 'em' );
			expect( children[ 0 ].props.children ).toBe( 'Courgette' );
			expect( children[ 0 ].props.align ).toBe( 'left' );
			expect( children[ 1 ].type ).toBe( 'em' );
			expect( children[ 1 ].props.children ).toBe( 'Concombre' );
		} );
	} );

	describe( 'createHigherOrderComponent', () => {
		it( 'should use default name for anonymous function', () => {
			const TestComponent = createHigherOrderComponent(
				( OriginalComponent ) => OriginalComponent,
				'withTest'
			)( () => <div /> );

			expect( TestComponent.displayName ).toBe( 'WithTest(Component)' );
		} );

		it( 'should use camel case starting with upper for wrapper prefix ', () => {
			const TestComponent = createHigherOrderComponent(
				( OriginalComponent ) => OriginalComponent,
				'with-one-two_threeFOUR'
			)( () => <div /> );

			expect( TestComponent.displayName ).toBe( 'WithOneTwoThreeFour(Component)' );
		} );

		it( 'should use function name', () => {
			function SomeComponent() {
				return <div />;
			}
			const TestComponent = createHigherOrderComponent(
				( OriginalComponent ) => OriginalComponent,
				'withTest'
			)( SomeComponent );

			expect( TestComponent.displayName ).toBe( 'WithTest(SomeComponent)' );
		} );

		it( 'should use component class name', () => {
			class SomeAnotherComponent extends Component {
				render() {
					return <div />;
				}
			}
			const TestComponent = createHigherOrderComponent(
				( OriginalComponent ) => OriginalComponent,
				'withTest'
			)( SomeAnotherComponent );

			expect( TestComponent.displayName ).toBe( 'WithTest(SomeAnotherComponent)' );
		} );

		it( 'should use displayName property', () => {
			class SomeYetAnotherComponent extends Component {
				render() {
					return <div />;
				}
			}
			SomeYetAnotherComponent.displayName = 'CustomDisplayName';
			const TestComponent = createHigherOrderComponent(
				( OriginalComponent ) => OriginalComponent,
				'withTest'
			)( SomeYetAnotherComponent );

			expect( TestComponent.displayName ).toBe( 'WithTest(CustomDisplayName)' );
		} );
	} );

	describe( 'RawHTML', () => {
		it( 'is dangerous', () => {
			const html = '<p>So scary!</p>';
			const element = shallow(
				<RawHTML>
					{ html }
				</RawHTML>
			);

			expect( element.type() ).toBe( 'div' );
			expect( element.prop( 'dangerouslySetInnerHTML' ).__html ).toBe( html );
			expect( element.prop( 'children' ) ).toBe( undefined );
		} );

		it( 'creates wrapper if assigned other props', () => {
			const html = '<p>So scary!</p>';
			const element = shallow(
				<RawHTML className="foo">
					{ html }
				</RawHTML>
			);

			expect( element.type() ).toBe( 'div' );
			expect( element.prop( 'className' ) ).toBe( 'foo' );
			expect( element.prop( 'dangerouslySetInnerHTML' ).__html ).toBe( html );
			expect( element.prop( 'children' ) ).toBe( undefined );
		} );
	} );

	describe( 'pure', () => {
		it( 'functional component should rerender only when props change', () => {
			let i = 0;
			const MyComp = pure( () => {
				return <p>{ ++i }</p>;
			} );
			const wrapper = mount( <MyComp /> );
			wrapper.update(); // Updating with same props doesn't rerender
			expect( wrapper.html() ).toBe( '<p>1</p>' );
			wrapper.setProps( { prop: 'a' } ); // New prop should trigger a rerender
			expect( wrapper.html() ).toBe( '<p>2</p>' );
			wrapper.setProps( { prop: 'a' } ); // Keeping the same prop value should not rerender
			expect( wrapper.html() ).toBe( '<p>2</p>' );
			wrapper.setProps( { prop: 'b' } ); // Changing the prop value should rerender
			expect( wrapper.html() ).toBe( '<p>3</p>' );
		} );

		it( 'class component should rerender if the props or state change', () => {
			let i = 0;
			const MyComp = pure( class extends Component {
				constructor() {
					super( ...arguments );
					this.state = {};
				}
				render() {
					return <p>{ ++i }</p>;
				}
			} );
			const wrapper = mount( <MyComp /> );
			wrapper.update(); // Updating with same props doesn't rerender
			expect( wrapper.html() ).toBe( '<p>1</p>' );
			wrapper.setProps( { prop: 'a' } ); // New prop should trigger a rerender
			expect( wrapper.html() ).toBe( '<p>2</p>' );
			wrapper.setProps( { prop: 'a' } ); // Keeping the same prop value should not rerender
			expect( wrapper.html() ).toBe( '<p>2</p>' );
			wrapper.setProps( { prop: 'b' } ); // Changing the prop value should rerender
			expect( wrapper.html() ).toBe( '<p>3</p>' );
			wrapper.setState( { state: 'a' } ); // New state value should trigger a rerender
			expect( wrapper.html() ).toBe( '<p>4</p>' );
			wrapper.setState( { state: 'a' } ); // Keeping the same state value should not trigger a rerender
			expect( wrapper.html() ).toBe( '<p>4</p>' );
		} );
	} );
} );
