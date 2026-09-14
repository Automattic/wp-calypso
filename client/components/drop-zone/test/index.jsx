/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react';
import { Component, createRef } from 'react';
import { DropZone } from '../';

class Wrapper extends Component {
	render() {
		return <div>{ this.props.children }</div>;
	}
}

describe( 'index', () => {
	const requiredProps = {
		hideDropZone: () => {},
		showDropZone: () => {},
		translate: ( string ) => string,
	};

	// Renders into a container with a known id so tests can assert on the node's placement,
	// and returns the instance via a ref. Testing Library removes the container on cleanup.
	function renderDropZone( props = {} ) {
		const container = document.body.appendChild( document.createElement( 'div' ) );
		container.id = 'container';

		const ref = createRef();
		render( <DropZone { ...requiredProps } { ...props } ref={ ref } />, { container } );
		return ref.current;
	}

	beforeAll( () => {
		window.MutationObserver = jest.fn( () => ( {
			observe: jest.fn(),
			disconnect: jest.fn(),
		} ) );
	} );

	afterAll( () => {
		if ( global.window && global.window.MutationObserver ) {
			delete global.window.MutationObserver;
		}
	} );

	afterEach( () => {
		// Restore the instance and HTMLElement.prototype.contains spies some tests install.
		jest.restoreAllMocks();
	} );

	test( 'should render as a child of its container by default', () => {
		const tree = renderDropZone();

		expect( tree.zoneRef.current.parentNode.id ).toEqual( 'container' );
	} );

	test( 'should accept a fullScreen prop to be rendered at the root', () => {
		const tree = renderDropZone( { fullScreen: true } );

		expect( tree.zoneRef.current.parentNode.id ).not.toEqual( 'container' );
		expect( tree.zoneRef.current.parentNode.parentNode ).toBe( document.body );
	} );

	test( 'should render default content if none is provided', () => {
		const tree = renderDropZone();
		const zone = tree.zoneRef.current;

		expect( zone.querySelector( '.drop-zone__content-icon' ) ).toBeVisible();
		expect( zone.querySelector( '.drop-zone__content-text' ) ).toBeVisible();
		expect( zone.querySelector( '.drop-zone__content' ) ).toHaveTextContent(
			'Drop files to upload'
		);
	} );

	test( 'should accept children to override the default content', () => {
		const tree = renderDropZone( { children: 'Hello World' } );

		expect( tree.zoneRef.current.querySelector( '.drop-zone__content' ) ).toHaveTextContent(
			'Hello World'
		);
	} );

	test( 'should accept an icon to override the default icon', () => {
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		const tree = renderDropZone( { icon: <div className="customIconClassName" /> } );

		expect( tree.zoneRef.current.querySelector( '.customIconClassName' ) ).toBeVisible();
	} );

	test( 'should highlight the drop zone when dragging over the body', () => {
		const tree = renderDropZone();

		act( () => {
			window.dispatchEvent( new window.MouseEvent( 'dragenter' ) );
		} );

		expect( tree.zoneRef.current ).toHaveClass( 'is-dragging-over-document' );
		expect( tree.zoneRef.current ).not.toHaveClass( 'is-dragging-over-element' );
	} );

	test( 'should start observing the body for mutations when dragging over', () => {
		const tree = renderDropZone();

		act( () => {
			window.dispatchEvent( new window.MouseEvent( 'dragenter' ) );
		} );

		expect( tree.observer ).toBeTruthy();
	} );

	test( 'should stop observing the body for mutations upon drag ending', () => {
		const tree = renderDropZone();

		act( () => {
			window.dispatchEvent( new window.MouseEvent( 'dragenter' ) );
		} );
		act( () => {
			window.dispatchEvent( new window.MouseEvent( 'dragleave' ) );
		} );

		expect( tree.observer ).toBeUndefined();
	} );

	test( 'should not highlight if onVerifyValidTransfer returns false', () => {
		const tree = renderDropZone( { onVerifyValidTransfer: () => false } );

		act( () => {
			window.dispatchEvent( new window.MouseEvent( 'dragenter' ) );
		} );

		expect( tree.zoneRef.current ).not.toHaveClass( 'is-dragging-over-document' );
		expect( tree.zoneRef.current ).not.toHaveClass( 'is-dragging-over-element' );
	} );

	test( 'should further highlight the drop zone when dragging over the element', () => {
		const tree = renderDropZone();
		jest.spyOn( tree, 'isWithinZoneBounds' ).mockReturnValue( true );

		act( () => {
			window.dispatchEvent( new window.MouseEvent( 'dragenter' ) );
		} );

		expect( tree.zoneRef.current ).toHaveClass( 'is-dragging-over-document' );
		expect( tree.zoneRef.current ).toHaveClass( 'is-dragging-over-element' );
	} );

	test( 'should further highlight the drop zone when dragging over the body if fullScreen', () => {
		const tree = renderDropZone( { fullScreen: true } );

		act( () => {
			window.dispatchEvent( new window.MouseEvent( 'dragenter' ) );
		} );

		expect( tree.zoneRef.current ).toHaveClass( 'is-dragging-over-document' );
		expect( tree.zoneRef.current ).toHaveClass( 'is-dragging-over-element' );
	} );

	test( 'should call onDrop with the raw event data when a drop occurs', () => {
		const spyDrop = jest.fn();
		jest.spyOn( window.HTMLElement.prototype, 'contains' ).mockReturnValue( true );

		renderDropZone( { onDrop: spyDrop } );

		const dropEvent = new window.MouseEvent( 'drop' );
		act( () => {
			window.dispatchEvent( dropEvent );
		} );

		expect( spyDrop ).toHaveBeenCalledTimes( 1 );
		expect( spyDrop.mock.calls[ 0 ][ 0 ] ).toBe( dropEvent );
	} );

	test( 'should call onFilesDrop with the files array when a drop occurs', () => {
		const spyDrop = jest.fn();
		jest.spyOn( window.HTMLElement.prototype, 'contains' ).mockReturnValue( true );

		renderDropZone( { onFilesDrop: spyDrop } );

		const dropEvent = new window.MouseEvent( 'drop' );
		dropEvent.dataTransfer = { files: [ 1, 2, 3 ] };
		act( () => {
			window.dispatchEvent( dropEvent );
		} );

		expect( spyDrop ).toHaveBeenCalledTimes( 1 );
		expect( spyDrop.mock.calls[ 0 ][ 0 ] ).toEqual( [ 1, 2, 3 ] );
	} );

	test( 'should not call onFilesDrop if onVerifyValidTransfer returns false', () => {
		const spyDrop = jest.fn();

		renderDropZone( {
			fullScreen: true, // bypass a Node.contains check on the drop event
			onFilesDrop: spyDrop,
			onVerifyValidTransfer: () => false,
		} );

		const dropEvent = new window.MouseEvent( 'drop' );
		dropEvent.dataTransfer = { files: [ 1, 2, 3 ] };
		act( () => {
			window.dispatchEvent( dropEvent );
		} );

		expect( spyDrop ).not.toHaveBeenCalled();
	} );

	test( 'should allow more than one rendered DropZone on a page', () => {
		render(
			<Wrapper>
				<DropZone { ...requiredProps } />
				<DropZone { ...requiredProps } />
			</Wrapper>
		);

		act( () => {
			window.dispatchEvent( new window.MouseEvent( 'dragenter' ) );
		} );

		const zones = document.querySelectorAll( '.drop-zone' );
		expect( zones ).toHaveLength( 2 );
		zones.forEach( ( zone ) => {
			expect( zone ).toHaveClass( 'is-dragging-over-document' );
			expect( zone ).not.toHaveClass( 'is-dragging-over-element' );
		} );
	} );

	test( 'should accept a custom textLabel to override the default text', () => {
		const tree = renderDropZone( { textLabel: 'Custom Drop Zone Label' } );

		expect( tree.zoneRef.current.querySelector( '.drop-zone__content-text' ) ).toHaveTextContent(
			'Custom Drop Zone Label'
		);
	} );

	test( 'should show the default text label if none specified', () => {
		const tree = renderDropZone();

		expect( tree.zoneRef.current.querySelector( '.drop-zone__content-text' ) ).toHaveTextContent(
			'Drop files to upload'
		);
	} );
} );
