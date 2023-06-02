/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ReactDom from 'react-dom';
import RootChild from '..';

/**
 * Module variables
 */
function Greeting( { toWhom = 'World' } ) {
	return (
		/* eslint-disable-next-line wpcalypso/jsx-classname-namespace */
		<div className="parent">
			<h1 data-testid="parent-child">Greeting</h1>
			<RootChild>
				<span data-testid="root-child">Hello { toWhom }!</span>
			</RootChild>
		</div>
	);
}

describe( 'RootChild', () => {
	let container;

	beforeAll( function () {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		ReactDom.unmountComponentAtNode( container );
	} );

	describe( 'rendering', () => {
		test( 'should render any children as descendants of body', () => {
			render( <Greeting />, { container } );

			const wrapper = screen.getByTestId( 'parent-child' ).parentNode;

			expect( wrapper ).toHaveClass( 'parent' );
			expect( wrapper.parentNode ).toBe( container );
		} );

		test( 'should update the children if parent is re-rendered', () => {
			const { rerender } = render( <Greeting />, { container } );

			rerender( <Greeting toWhom="Universe" /> );

			expect( screen.getByTestId( 'root-child' ) ).toHaveTextContent( 'Hello Universe!' );
		} );
	} );

	describe( 'unmounting', () => {
		test( 'should destroy the root child when the component is unmounted', () => {
			const { container: body, unmount } = render( <Greeting toWhom="Universe" />, { container } );

			unmount();

			expect( body ).toBeEmptyDOMElement();
		} );
	} );
} );
