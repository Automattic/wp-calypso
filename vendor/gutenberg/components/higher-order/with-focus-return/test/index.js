/**
 * External dependencies
 */
import renderer from 'react-test-renderer';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import withFocusReturn from '../';

class Test extends Component {
	render() {
		return (
			<div className="test">Testing</div>
		);
	}
}

describe( 'withFocusReturn()', () => {
	describe( 'testing rendering and focus handling', () => {
		const Composite = withFocusReturn( Test );
		const activeElement = document.createElement( 'button' );
		const switchFocusTo = document.createElement( 'input' );

		const getInstance = ( wrapper ) => {
			return wrapper.root.find(
				( node ) => node.instance instanceof Component
			).instance;
		};

		beforeEach( () => {
			activeElement.focus();
		} );

		afterEach( () => {
			activeElement.blur();
		} );

		it( 'should render a basic Test component inside the HOC', () => {
			const renderedComposite = renderer.create( <Composite /> );
			const wrappedElement = renderedComposite.root.findByType( Test );
			const wrappedElementShallow = wrappedElement.children[ 0 ];
			expect( wrappedElementShallow.props.className ).toBe( 'test' );
			expect( wrappedElementShallow.type ).toBe( 'div' );
			expect( wrappedElementShallow.children[ 0 ] ).toBe( 'Testing' );
		} );

		it( 'should pass additional props through to the wrapped element', () => {
			const renderedComposite = renderer.create( <Composite test="test" /> );
			const wrappedElement = renderedComposite.root.findByType( Test );
			// Ensure that the wrapped Test element has the appropriate props.
			expect( wrappedElement.props.test ).toBe( 'test' );
		} );

		it( 'should not switch focus back to the bound focus element', () => {
			const mountedComposite = renderer.create( <Composite /> );

			expect( getInstance( mountedComposite ).activeElementOnMount ).toBe( activeElement );

			// Change activeElement.
			switchFocusTo.focus();
			expect( document.activeElement ).toBe( switchFocusTo );

			// Should keep focus on switchFocusTo, because it is not within HOC.
			mountedComposite.unmount();
			expect( document.activeElement ).toBe( switchFocusTo );
		} );

		it( 'should return focus to element associated with HOC', () => {
			const mountedComposite = renderer.create( <Composite /> );
			expect( getInstance( mountedComposite ).activeElementOnMount ).toBe( activeElement );

			// Change activeElement.
			document.activeElement.blur();
			expect( document.activeElement ).toBe( document.body );

			// Should return to the activeElement saved with this component.
			mountedComposite.unmount();
			expect( document.activeElement ).toBe( activeElement );
		} );
	} );
} );
