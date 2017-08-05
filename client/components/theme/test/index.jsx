/** @jest-environment jsdom */
jest.mock( 'components/popover/menu', () => require( 'components/empty-component' ) );
jest.mock( 'components/popover/menu-item', () => require( 'components/empty-component' ) );
jest.mock( 'lib/user', () => () => {} );

/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';
import { identity } from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import { Theme } from '../';

describe( 'Theme', function() {
	let props, themeNode;

	beforeEach( function() {
		props = {
			theme: {
				id: 'atheme',
				name: 'Theme name',
				screenshot: '/theme/screenshot.png',
			},
			buttonContents: { dummyAction: { label: 'Dummy action', action: sinon.spy() } }, // TODO: test if called when clicked
			translate: identity
		};
	} );

	describe( 'rendering', function() {
		context( 'with default display buttonContents', function() {
			beforeEach( function() {
				props.onScreenshotClick = sinon.spy();
				const themeElement = TestUtils.renderIntoDocument( React.createElement( Theme, props ) );
				themeNode = ReactDom.findDOMNode( themeElement );
			} );

			it( 'should render a <div> with a className of "theme"', function() {
				assert( themeNode !== null, 'DOM node doesn\'t exist' );
				assert( themeNode.nodeName === 'DIV', 'nodeName doesn\'t equal "DIV"' );
				assert.include( themeNode.className, 'theme is-actionable', 'className does not contain "theme is-actionable"' );

				assert( themeNode.getElementsByTagName( 'h2' )[ 0 ].textContent === 'Theme name' );
			} );

			it( 'should render a screenshot', function() {
				const imgNode = themeNode.getElementsByTagName( 'img' )[ 0 ];
				assert.include( imgNode.getAttribute( 'src' ), '/theme/screenshot.png' );
			} );

			it( 'should call onScreenshotClick() on click on screenshot', function() {
				const imgNode = themeNode.getElementsByTagName( 'img' )[ 0 ];
				TestUtils.Simulate.click( imgNode );
				assert( props.onScreenshotClick.calledOnce, 'onClick did not trigger onScreenshotClick' );
			} );

			it( 'should not show a price when there is none', function() {
				assert( themeNode.getElementsByClassName( 'price' ).length === 0, 'price should not appear' );
			} );

			it( 'should render a More button', function() {
				const more = themeNode.getElementsByClassName( 'theme__more-button' );

				assert( more.length === 1, 'More button container not found' );
				assert( more[ 0 ].getElementsByTagName( 'button' ).length === 1, 'More button not found' );
			} );
		} );

		context( 'with empty buttonContents', function() {
			beforeEach( function() {
				props.buttonContents = {};
				const themeElement = TestUtils.renderIntoDocument( React.createElement( Theme, props ) );
				themeNode = ReactDom.findDOMNode( themeElement );
			} );

			it( 'should not render a More button', function() {
				const more = themeNode.getElementsByClassName( 'theme__more-button' );

				assert( more.length === 0, 'More button container found' );
			} );
		} );
	} );

	context( 'when isPlaceholder is set to true', function() {
		beforeEach( function() {
			const themeElement = TestUtils.renderIntoDocument(
				React.createElement( Theme, {
					theme: { id: 'placeholder-1', name: 'Loading' },
					isPlaceholder: true,
					translate: identity
				} )
			);
			themeNode = ReactDom.findDOMNode( themeElement );
		} );

		it( 'should render a <div> with an is-placeholder class', function() {
			assert( themeNode.nodeName === 'DIV', 'nodeName doesn\'t equal "DIV"' );
			assert.include( themeNode.className, 'is-placeholder', 'no is-placeholder' );
		} );
	} );

	context( 'when the theme has a price', function() {
		beforeEach( function() {
			const themeElement = TestUtils.renderIntoDocument(
				React.createElement( Theme, { ...props, price: '$50' } )
			);
			themeNode = ReactDom.findDOMNode( themeElement );
		} );

		it( 'should show a price', function() {
			assert( themeNode.getElementsByClassName( 'theme-badge__price' )[ 0 ].textContent === '$50' );
		} );
	} );
} );
