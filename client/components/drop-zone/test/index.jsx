/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { DropZone } from '../';

class Wrapper extends React.Component {
	render() {
		return <div>{ this.props.children }</div>;
	}
}

describe( 'index', () => {
	let container, sandbox;
	const requiredProps = {
		hideDropZone: () => {},
		showDropZone: () => {},
	};

	beforeAll( function () {
		container = document.createElement( 'div' );
		container.id = 'container';
		window.MutationObserver = sinon.stub().returns( {
			observe: sinon.stub(),
			disconnect: sinon.stub(),
		} );
	} );

	afterAll( function () {
		if ( global.window && global.window.MutationObserver ) {
			delete global.window.MutationObserver;
		}
	} );

	beforeEach( () => {
		sandbox = sinon.createSandbox();
	} );

	afterEach( () => {
		sandbox.restore();
		ReactDom.unmountComponentAtNode( container );
	} );

	test( 'should render as a child of its container by default', () => {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container );

		expect( tree.zoneRef.current.parentNode.id ).to.equal( 'container' );
	} );

	test( 'should accept a fullScreen prop to be rendered at the root', () => {
		const tree = ReactDom.render(
			React.createElement( DropZone, {
				...requiredProps,
				fullScreen: true,
			} ),
			container
		);

		expect( tree.zoneRef.current.parentNode.id ).to.not.equal( 'container' );
		expect( tree.zoneRef.current.parentNode.parentNode ).to.eql( document.body );
	} );

	test( 'should render default content if none is provided', () => {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container ),
			content = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content' );

		TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-icon' );
		TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-text' );
		expect( content.textContent ).to.equal( 'Drop files to upload' );
	} );

	test( 'should accept children to override the default content', () => {
		const tree = ReactDom.render(
				React.createElement( DropZone, requiredProps, 'Hello World' ),
				container
			),
			content = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content' );

		expect( content.textContent ).to.equal( 'Hello World' );
	} );

	test( 'should accept an icon to override the default icon', () => {
		const tree = ReactDom.render(
			React.createElement( DropZone, {
				...requiredProps,
				icon: <div className="customIconClassName" />,
			} ),
			container
		);

		const icon = TestUtils.findRenderedDOMComponentWithClass( tree, 'customIconClassName' );

		expect( TestUtils.isDOMComponent( icon ) ).to.equal( true );
	} );

	test( 'should highlight the drop zone when dragging over the body', () => {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container ),
			dragEnterEvent = new window.MouseEvent( 'dragenter' );

		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.not.be.ok;
	} );

	test( 'should start observing the body for mutations when dragging over', ( done ) => {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container ),
			dragEnterEvent = new window.MouseEvent( 'dragenter' );

		window.dispatchEvent( dragEnterEvent );

		process.nextTick( function () {
			expect( tree.observer ).to.be.ok;
			done();
		} );
	} );

	test( 'should stop observing the body for mutations upon drag ending', ( done ) => {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container ),
			dragEnterEvent = new window.MouseEvent( 'dragenter' ),
			dragLeaveEvent = new window.MouseEvent( 'dragleave' );

		window.dispatchEvent( dragEnterEvent );
		window.dispatchEvent( dragLeaveEvent );

		process.nextTick( function () {
			expect( tree.observer ).to.be.undefined;
			done();
		} );
	} );

	test( 'should not highlight if onVerifyValidTransfer returns false', () => {
		const dragEnterEvent = new window.MouseEvent( 'dragenter' );

		const tree = ReactDom.render(
			React.createElement( DropZone, {
				...requiredProps,
				onVerifyValidTransfer: function () {
					return false;
				},
			} ),
			container
		);

		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.not.be.ok;
		expect( tree.state.isDraggingOverElement ).to.not.be.ok;
	} );

	test( 'should further highlight the drop zone when dragging over the element', () => {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container );
		sandbox.stub( tree, 'isWithinZoneBounds' ).returns( true );

		const dragEnterEvent = new window.MouseEvent( 'dragenter' );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.be.ok;
	} );

	test( 'should further highlight the drop zone when dragging over the body if fullScreen', () => {
		const tree = ReactDom.render(
			React.createElement( DropZone, {
				...requiredProps,
				fullScreen: true,
			} ),
			container
		);

		const dragEnterEvent = new window.MouseEvent( 'dragenter' );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.be.ok;
	} );

	test( 'should call onDrop with the raw event data when a drop occurs', () => {
		const spyDrop = sandbox.spy();

		sandbox.stub( window.HTMLElement.prototype, 'contains' ).returns( true );

		ReactDom.render(
			React.createElement( DropZone, {
				...requiredProps,
				onDrop: spyDrop,
			} ),
			container
		);

		const dropEvent = new window.MouseEvent( 'drop' );
		window.dispatchEvent( dropEvent );

		expect( spyDrop.calledOnce ).to.be.ok;
		expect( spyDrop.getCall( 0 ).args[ 0 ] ).to.eql( dropEvent );
	} );

	test( 'should call onFilesDrop with the files array when a drop occurs', () => {
		const spyDrop = sandbox.spy();

		sandbox.stub( window.HTMLElement.prototype, 'contains' ).returns( true );
		ReactDom.render(
			React.createElement( DropZone, {
				...requiredProps,
				onFilesDrop: spyDrop,
			} ),
			container
		);

		const dropEvent = new window.MouseEvent( 'drop' );
		dropEvent.dataTransfer = { files: [ 1, 2, 3 ] };
		window.dispatchEvent( dropEvent );

		expect( spyDrop.calledOnce ).to.be.ok;
		expect( spyDrop.getCall( 0 ).args[ 0 ] ).to.eql( [ 1, 2, 3 ] );
	} );

	test( 'should not call onFilesDrop if onVerifyValidTransfer returns false', () => {
		const spyDrop = sandbox.spy();
		const dropEvent = new window.MouseEvent( 'drop' );

		ReactDom.render(
			React.createElement( DropZone, {
				...requiredProps,
				fullScreen: true, // bypass a Node.contains check on the drop event
				onFilesDrop: spyDrop,
				onVerifyValidTransfer: function () {
					return false;
				},
			} ),
			container
		);

		dropEvent.dataTransfer = { files: [ 1, 2, 3 ] };
		window.dispatchEvent( dropEvent );

		expect( spyDrop.called ).to.not.be.ok;
	} );

	test( 'should allow more than one rendered DropZone on a page', () => {
		const tree = ReactDom.render(
			React.createElement(
				Wrapper,
				null,
				React.createElement( DropZone, requiredProps ),
				React.createElement( DropZone, requiredProps )
			),
			container
		);

		const rendered = TestUtils.scryRenderedComponentsWithType( tree, DropZone );

		const dragEnterEvent = new window.MouseEvent( 'dragenter' );
		window.dispatchEvent( dragEnterEvent );

		expect( rendered ).to.have.lengthOf( 2 );
		rendered.forEach( function ( zone ) {
			expect( zone.state.isDraggingOverDocument ).to.be.ok;
			expect( zone.state.isDraggingOverElement ).to.not.be.ok;
		} );
	} );

	test( 'should accept a custom textLabel to override the default text', () => {
		const tree = ReactDom.render(
			React.createElement( DropZone, {
				...requiredProps,
				textLabel: 'Custom Drop Zone Label',
			} ),
			container
		);

		const textContent = TestUtils.findRenderedDOMComponentWithClass(
			tree,
			'drop-zone__content-text'
		);

		expect( textContent.textContent ).to.equal( 'Custom Drop Zone Label' );
	} );

	test( 'should show the default text label if none specified', () => {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container );

		const textContent = TestUtils.findRenderedDOMComponentWithClass(
			tree,
			'drop-zone__content-text'
		);

		expect( textContent.textContent ).to.equal( 'Drop files to upload' );
	} );
} );
