import { expect } from 'chai';
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import { DropZone } from '../';

const Wrapper = React.createClass( {
	render: function() {
		return <div>{ this.props.children }</div>;
	}
} );

describe( 'index', function() {
	var container, sandbox;
	require( 'test/helpers/use-fake-dom' )( '<html><body><div id="container"></div></body></html>' );

	before( function() {
		container = document.getElementById( 'container' );
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
		var tree = ReactDom.render( React.createElement( DropZone ), container );

		expect( tree.refs.zone.parentNode.id ).to.equal( 'container' );
	} );

	it( 'should accept a fullScreen prop to be rendered at the root', function() {
		var tree = ReactDom.render( React.createElement( DropZone, {
			fullScreen: true
		} ), container );

		expect( tree.refs.zone.parentNode.id ).to.not.equal( 'container' );
		expect( tree.refs.zone.parentNode.parentNode ).to.eql( document.body );
	} );

	it( 'should render default content if none is provided', function() {
		var tree = ReactDom.render( React.createElement( DropZone ), container ),
			content = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content' );

		TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-icon' );
		TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-text' );
		expect( content.textContent ).to.equal( 'Drop files to upload' );
	} );

	it( 'should accept children to override the default content', function() {
		var tree = ReactDom.render( React.createElement( DropZone, null, 'Hello World' ), container ),
			content = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content' );

		expect( content.textContent ).to.equal( 'Hello World' );
	} );

	it( 'should accept an icon to override the default icon', function() {
		var tree = ReactDom.render( React.createElement( DropZone, {
				icon: 'house'
			} ), container ), icon;

		icon = TestUtils.findRenderedDOMComponentWithClass( tree, 'drop-zone__content-icon' );

		expect( icon.className ).to.contain( 'gridicons-house' );
	} );

	it( 'should highlight the drop zone when dragging over the body', function() {
		var tree = ReactDom.render( React.createElement( DropZone ), container ),
			dragEnterEvent = new window.MouseEvent( 'dragenter' );

		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.not.be.ok;
	} );

	it( 'should start observing the body for mutations when dragging over', function( done ) {
		var tree = ReactDom.render( React.createElement( DropZone ), container ),
			dragEnterEvent = new window.MouseEvent( 'dragenter' );

		window.dispatchEvent( dragEnterEvent );

		process.nextTick( function() {
			expect( tree.observer ).to.be.ok;
			done();
		} );
	} );

	it( 'should stop observing the body for mutations upon drag ending', function( done ) {
		var tree = ReactDom.render( React.createElement( DropZone ), container ),
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
		var dragEnterEvent = new window.MouseEvent( 'dragenter' ),
			tree;

		tree = ReactDom.render( React.createElement( DropZone, {
			onVerifyValidTransfer: function() {
				return false;
			}
		} ), container );

		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.not.be.ok;
		expect( tree.state.isDraggingOverElement ).to.not.be.ok;
	} );

	it( 'should further highlight the drop zone when dragging over the element', function() {
		var tree, dragEnterEvent;

		sandbox.stub( DropZone.prototype, 'isWithinZoneBounds' ).returns( true );

		tree = ReactDom.render( React.createElement( DropZone ), container );

		dragEnterEvent = new window.MouseEvent( 'dragenter' );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.be.ok;
	} );

	it( 'should further highlight the drop zone when dragging over the body if fullScreen', function() {
		var tree = ReactDom.render( React.createElement( DropZone, {
				fullScreen: true
			} ), container ), dragEnterEvent;

		dragEnterEvent = new window.MouseEvent( 'dragenter' );
		window.dispatchEvent( dragEnterEvent );

		expect( tree.state.isDraggingOverDocument ).to.be.ok;
		expect( tree.state.isDraggingOverElement ).to.be.ok;
	} );

	it( 'should call onDrop with the raw event data when a drop occurs', function() {
		var dropEvent,
			spyDrop = sandbox.spy();

		sandbox.stub( window.HTMLElement.prototype, 'contains' ).returns( true );

		ReactDom.render( React.createElement( DropZone, {
			onDrop: spyDrop
		} ), container );

		dropEvent = new window.MouseEvent( 'drop' );
		window.dispatchEvent( dropEvent );

		expect( spyDrop.calledOnce ).to.be.ok;
		expect( spyDrop.getCall( 0 ).args[0] ).to.eql( dropEvent );
	} );

	it( 'should call onFilesDrop with the files array when a drop occurs', function() {
		var dropEvent,
			spyDrop = sandbox.spy();

		sandbox.stub( window.HTMLElement.prototype, 'contains' ).returns( true );
		ReactDom.render( React.createElement( DropZone, {
			onFilesDrop: spyDrop
		} ), container );

		dropEvent = new window.MouseEvent( 'drop' );
		dropEvent.dataTransfer = { files: [ 1, 2, 3 ] };
		window.dispatchEvent( dropEvent );

		expect( spyDrop.calledOnce ).to.be.ok;
		expect( spyDrop.getCall( 0 ).args[0] ).to.eql( [ 1, 2, 3 ] );
	} );

	it( 'should not call onFilesDrop if onVerifyValidTransfer returns false', function() {
		var spyDrop = sandbox.spy(),
			dropEvent = new window.MouseEvent( 'drop' );

		ReactDom.render( React.createElement( DropZone, {
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
		var tree = ReactDom.render(
			React.createElement(
				Wrapper,
				null,
				React.createElement( DropZone ),
				React.createElement( DropZone )
			),
			container
		), dragEnterEvent, rendered;

		rendered = TestUtils.scryRenderedComponentsWithType( tree, DropZone );

		dragEnterEvent = new window.MouseEvent( 'dragenter' );
		window.dispatchEvent( dragEnterEvent );

		expect( rendered ).to.have.length.of( 2 );
		rendered.forEach( function( zone ) {
			expect( zone.state.isDraggingOverDocument ).to.be.ok;
			expect( zone.state.isDraggingOverElement ).to.not.be.ok;
		} );
	} );
} );
