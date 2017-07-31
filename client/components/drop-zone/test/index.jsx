/** @jest-environment jsdom */

/**
 * External dependencies
 */
import { expect } from 'chai';
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { DropZone } from '../';

const Wrapper = React.createClass( {
	render: function() {
		return <div>{ this.props.children }</div>;
	}
} );

describe( 'index', function() {
	let container, sandbox;
	const requiredProps = {
		hideDropZone: () => {},
		showDropZone: () => {}
	};

	before( function() {
		container = document.createElement( 'div' );
		container.id = 'container';
		window.MutationObserver = sinon.stub().returns( {
			observe: sinon.stub(),
			disconnect: sinon.stub()
		} );
	} );

	after( function() {
		if ( global.window && global.window.MutationObserver ) {
			delete global.window.MutationObserver;
		}
	} );

	beforeEach( function() {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( function() {
		sandbox.restore();
		ReactDom.unmountComponentAtNode( container );
	} );

	it( 'should render as a child of its container by default', function() {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container );

		expect( tree.refs.zone.parentNode.id ).to.equal( 'container' );
	} );

	it( 'should accept a fullScreen prop to be rendered at the root', function() {
		const tree = ReactDom.render( React.createElement( DropZone, {
			...requiredProps,
			fullScreen: true
		} ), container );

		expect( tree.refs.zone.parentNode.id ).to.not.equal( 'container' );
		expect( tree.refs.zone.parentNode.parentNode ).to.eql( document.body );
	} );

	it( 'should render default content if none is provided', function() {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container ),
			content = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content' );

		TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-icon' );
		TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-text' );
		expect( content.textContent ).to.equal( 'Drop files to upload' );
	} );

	it( 'should accept children to override the default content', function() {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps, 'Hello World' ), container ),
			content = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content' );

		expect( content.textContent ).to.equal( 'Hello World' );
	} );

	it( 'should accept an icon to override the default icon', function() {
		const tree = ReactDom.render( React.createElement( DropZone, {
			...requiredProps,
			icon: <div className="customIconClassName" />
		} ), container );

		const icon = TestUtils.findRenderedDOMComponentWithClass( tree, 'customIconClassName' );

		expect( TestUtils.isDOMComponent( icon ) ).to.equal( true );
	} );

	it( 'should highlight the drop zone when dragging over the body', function() {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container ),
			dragEnterEvent = new window.MouseEvent( 'dragenter' );

		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.not.be.ok;
	} );

	it( 'should start observing the body for mutations when dragging over', function( done ) {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container ),
			dragEnterEvent = new window.MouseEvent( 'dragenter' );

		window.dispatchEvent( dragEnterEvent );

		process.nextTick( function() {
			expect( tree.observer ).to.be.ok;
			done();
		} );
	} );

	it( 'should stop observing the body for mutations upon drag ending', function( done ) {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container ),
			dragEnterEvent = new window.MouseEvent( 'dragenter' ),
			dragLeaveEvent = new window.MouseEvent( 'dragleave' );

		window.dispatchEvent( dragEnterEvent );
		window.dispatchEvent( dragLeaveEvent );

		process.nextTick( function() {
			expect( tree.observer ).to.be.undefined;
			done();
		} );
	} );

	it( 'should not highlight if onVerifyValidTransfer returns false', function() {
		const dragEnterEvent = new window.MouseEvent( 'dragenter' );

		const tree = ReactDom.render( React.createElement( DropZone, {
			...requiredProps,
			onVerifyValidTransfer: function() {
				return false;
			}
		} ), container );

		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.not.be.ok;
		expect( tree.state.isDraggingOverElement ).to.not.be.ok;
	} );

	it( 'should further highlight the drop zone when dragging over the element', function() {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container );
		sandbox.stub( tree, 'isWithinZoneBounds' ).returns( true );

		const dragEnterEvent = new window.MouseEvent( 'dragenter' );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.be.ok;
	} );

	it( 'should further highlight the drop zone when dragging over the body if fullScreen', function() {
		const tree = ReactDom.render( React.createElement( DropZone, {
			...requiredProps,
			fullScreen: true
		} ), container );

		const dragEnterEvent = new window.MouseEvent( 'dragenter' );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.be.ok;
	} );

	it( 'should call onDrop with the raw event data when a drop occurs', function() {
		const spyDrop = sandbox.spy();

		sandbox.stub( window.HTMLElement.prototype, 'contains' ).returns( true );

		ReactDom.render( React.createElement( DropZone, {
			...requiredProps,
			onDrop: spyDrop
		} ), container );

		const dropEvent = new window.MouseEvent( 'drop' );
		window.dispatchEvent( dropEvent );

		expect( spyDrop.calledOnce ).to.be.ok;
		expect( spyDrop.getCall( 0 ).args[ 0 ] ).to.eql( dropEvent );
	} );

	it( 'should call onFilesDrop with the files array when a drop occurs', function() {
		const spyDrop = sandbox.spy();

		sandbox.stub( window.HTMLElement.prototype, 'contains' ).returns( true );
		ReactDom.render( React.createElement( DropZone, {
			...requiredProps,
			onFilesDrop: spyDrop
		} ), container );

		const dropEvent = new window.MouseEvent( 'drop' );
		dropEvent.dataTransfer = { files: [ 1, 2, 3 ] };
		window.dispatchEvent( dropEvent );

		expect( spyDrop.calledOnce ).to.be.ok;
		expect( spyDrop.getCall( 0 ).args[ 0 ] ).to.eql( [ 1, 2, 3 ] );
	} );

	it( 'should not call onFilesDrop if onVerifyValidTransfer returns false', function() {
		const spyDrop = sandbox.spy(),
			dropEvent = new window.MouseEvent( 'drop' );

		ReactDom.render( React.createElement( DropZone, {
			...requiredProps,
			onFilesDrop: spyDrop,
			onVerifyValidTransfer: function() {
				return false;
			}
		} ), container );

		dropEvent.dataTransfer = { files: [ 1, 2, 3 ] };
		window.dispatchEvent( dropEvent );

		expect( spyDrop.called ).to.not.be.ok;
	} );

	it( 'should allow more than one rendered DropZone on a page', function() {
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

		expect( rendered ).to.have.length.of( 2 );
		rendered.forEach( function( zone ) {
			expect( zone.state.isDraggingOverDocument ).to.be.ok;
			expect( zone.state.isDraggingOverElement ).to.not.be.ok;
		} );
	} );

	it( 'should accept a custom textLabel to override the default text', function() {
		const tree = ReactDom.render( React.createElement( DropZone, {
			...requiredProps,
			textLabel: 'Custom Drop Zone Label'
		} ), container );

		const textContent = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-text' );

		expect( textContent.textContent ).to.equal( 'Custom Drop Zone Label' );
	} );

	it( 'should show the default text label if none specified', function() {
		const tree = ReactDom.render( React.createElement( DropZone, requiredProps ), container );

		const textContent = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-text' );

		expect( textContent.textContent ).to.equal( 'Drop files to upload' );
	} );
} );
