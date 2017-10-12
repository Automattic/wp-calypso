/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { identity } from 'lodash';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import ReactDom from 'react-dom';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { Theme } from '../';

jest.mock( 'components/popover/menu', () => require( 'components/empty-component' ) );
jest.mock( 'components/popover/menu-item', () => require( 'components/empty-component' ) );
jest.mock( 'lib/user', () => () => {} );

describe( 'Theme', () => {
	let props, themeNode;

	beforeEach( () => {
		props = {
			theme: {
				id: 'atheme',
				name: 'Theme name',
				screenshot: '/theme/screenshot.png',
			},
			buttonContents: { dummyAction: { label: 'Dummy action', action: sinon.spy() } }, // TODO: test if called when clicked
			translate: identity,
		};
	} );

	describe( 'rendering', () => {
		describe( 'with default display buttonContents', () => {
			beforeEach( () => {
				props.onScreenshotClick = sinon.spy();
				const themeElement = TestUtils.renderIntoDocument( React.createElement( Theme, props ) );
				themeNode = ReactDom.findDOMNode( themeElement );
			} );

			test( 'should render a <div> with a className of "theme"', () => {
				expect( themeNode !== null ).toBeTruthy();
				expect( themeNode.nodeName === 'DIV' ).toBeTruthy();
				expect( themeNode.className ).toContain( 'theme is-actionable' );

				expect(
					themeNode.getElementsByTagName( 'h2' )[ 0 ].textContent === 'Theme name'
				).toBeTruthy();
			} );

			test( 'should render a screenshot', () => {
				const imgNode = themeNode.getElementsByTagName( 'img' )[ 0 ];
				expect( imgNode.getAttribute( 'src' ) ).toContain( '/theme/screenshot.png' );
			} );

			test( 'should call onScreenshotClick() on click on screenshot', () => {
				const imgNode = themeNode.getElementsByTagName( 'img' )[ 0 ];
				TestUtils.Simulate.click( imgNode );
				expect( props.onScreenshotClick.calledOnce ).toBeTruthy();
			} );

			test( 'should not show a price when there is none', () => {
				expect( themeNode.getElementsByClassName( 'price' ).length === 0 ).toBeTruthy();
			} );

			test( 'should render a More button', () => {
				const more = themeNode.getElementsByClassName( 'theme__more-button' );

				expect( more.length === 1 ).toBeTruthy();
				expect( more[ 0 ].getElementsByTagName( 'button' ).length === 1 ).toBeTruthy();
			} );
		} );

		describe( 'with empty buttonContents', () => {
			beforeEach( () => {
				props.buttonContents = {};
				const themeElement = TestUtils.renderIntoDocument( React.createElement( Theme, props ) );
				themeNode = ReactDom.findDOMNode( themeElement );
			} );

			test( 'should not render a More button', () => {
				const more = themeNode.getElementsByClassName( 'theme__more-button' );

				expect( more.length === 0 ).toBeTruthy();
			} );
		} );
	} );

	describe( 'when isPlaceholder is set to true', () => {
		beforeEach( () => {
			const themeElement = TestUtils.renderIntoDocument(
				React.createElement( Theme, {
					theme: { id: 'placeholder-1', name: 'Loading' },
					isPlaceholder: true,
					translate: identity,
				} )
			);
			themeNode = ReactDom.findDOMNode( themeElement );
		} );

		test( 'should render a <div> with an is-placeholder class', () => {
			expect( themeNode.nodeName === 'DIV' ).toBeTruthy();
			expect( themeNode.className ).toContain( 'is-placeholder' );
		} );
	} );

	describe( 'when the theme has a price', () => {
		beforeEach( () => {
			const themeElement = TestUtils.renderIntoDocument(
				React.createElement( Theme, { ...props, price: '$50' } )
			);
			themeNode = ReactDom.findDOMNode( themeElement );
		} );

		test( 'should show a price', () => {
			expect(
				themeNode.getElementsByClassName( 'theme-badge__price' )[ 0 ].textContent === '$50'
			).toBeTruthy();
		} );
	} );
} );
