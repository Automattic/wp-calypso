/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import sinon from 'sinon';
import TestUtils from 'react-dom/test-utils';
import { assert } from 'chai';
import { identity } from 'lodash';
import { parse } from 'url';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { Theme } from '../';

jest.mock( 'calypso/components/popover/menu', () => 'components--popover--menu' );
jest.mock( 'calypso/components/popover/menu-item', () => 'components--popover--menu-item' );
jest.mock( 'calypso/lib/user', () => () => {} );

describe( 'Theme', () => {
	let props;
	let themeNode;

	beforeEach( () => {
		props = {
			theme: {
				id: 'twentyseventeen',
				name: 'Twenty Seventeen',
				screenshot:
					'https://i0.wp.com/s0.wp.com/wp-content/themes/pub/twentyseventeen/screenshot.png?ssl=1',
			},
			buttonContents: { dummyAction: { label: 'Dummy action', action: sinon.spy() } }, // TODO: test if called when clicked
			translate: identity,
			setThemesBookmark: () => {},
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
				assert( themeNode !== null, "DOM node doesn't exist" );
				assert( themeNode.nodeName === 'DIV', 'nodeName doesn\'t equal "DIV"' );
				assert.include(
					themeNode.className,
					'theme is-actionable',
					'className does not contain "theme is-actionable"'
				);

				assert( themeNode.getElementsByTagName( 'h2' )[ 0 ].textContent === 'Twenty Seventeen' );
			} );

			test( 'should render a screenshot', () => {
				const imgNode = themeNode.getElementsByTagName( 'img' )[ 0 ];
				const src = imgNode.getAttribute( 'src' );
				assert.include( src, '/screenshot.png' );
			} );

			test( 'should include photon parameters', () => {
				const imgNode = themeNode.getElementsByTagName( 'img' )[ 0 ];
				const src = imgNode.getAttribute( 'src' );
				const { query } = parse( src, true );

				expect( query ).toMatchObject( {
					fit: expect.stringMatching( /\d+,\d+/ ),
				} );
			} );

			test( 'should call onScreenshotClick() on click on screenshot', () => {
				const imgNode = themeNode.getElementsByTagName( 'img' )[ 0 ];
				TestUtils.Simulate.click( imgNode );
				assert( props.onScreenshotClick.calledOnce, 'onClick did not trigger onScreenshotClick' );
			} );

			test( 'should not show a price when there is none', () => {
				assert(
					themeNode.getElementsByClassName( 'price' ).length === 0,
					'price should not appear'
				);
			} );

			test( 'should render a More button', () => {
				const more = themeNode.getElementsByClassName( 'theme__more-button' );

				assert( more.length === 1, 'More button container not found' );
				assert( more[ 0 ].getElementsByTagName( 'button' ).length === 1, 'More button not found' );
			} );

			test( 'should match snapshot', () => {
				const rendered = shallow( <Theme { ...props } /> );
				expect( rendered ).toMatchSnapshot();
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

				assert( more.length === 0, 'More button container found' );
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
			assert( themeNode.nodeName === 'DIV', 'nodeName doesn\'t equal "DIV"' );
			assert.include( themeNode.className, 'is-placeholder', 'no is-placeholder' );
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
			assert( themeNode.getElementsByClassName( 'theme__badge-price' )[ 0 ].textContent === '$50' );
		} );
	} );
} );
