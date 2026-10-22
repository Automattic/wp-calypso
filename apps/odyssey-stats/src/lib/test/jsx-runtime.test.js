/**
 * @jest-environment jsdom
 */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Loads the module fresh, since it picks its runtime from the page's globals once, at load time.
 * @param {Object|undefined} wpRuntime What WordPress registered as `window.ReactJSXRuntime`.
 */
function loadRuntime( wpRuntime ) {
	window.React = React;
	if ( wpRuntime ) {
		window.ReactJSXRuntime = wpRuntime;
	} else {
		delete window.ReactJSXRuntime;
	}

	let runtime;
	jest.isolateModules( () => {
		runtime = require( '../jsx-runtime' );
	} );
	return runtime;
}

describe( 'jsx-runtime', () => {
	afterEach( () => {
		delete window.React;
		delete window.ReactJSXRuntime;
	} );

	it( "uses WordPress's runtime on WordPress 6.6+ instead of building elements itself", () => {
		const wpRuntime = { jsx: jest.fn(), jsxs: jest.fn(), Fragment: Symbol( 'wp-fragment' ) };

		const runtime = loadRuntime( wpRuntime );

		expect( runtime.jsx ).toBe( wpRuntime.jsx );
		expect( runtime.jsxs ).toBe( wpRuntime.jsxs );
		expect( runtime.Fragment ).toBe( wpRuntime.Fragment );
	} );

	it( 'still renders elements on WordPress < 6.6, where window.ReactJSXRuntime is missing', () => {
		const { jsx, Fragment } = loadRuntime( undefined );

		const element = jsx( 'p', { className: 'stats', children: 'Views' } );

		expect( React.isValidElement( element ) ).toBe( true );
		expect( element.type ).toBe( 'p' );
		expect( element.props ).toEqual( { className: 'stats', children: 'Views' } );
		expect( Fragment ).toBe( React.Fragment );
	} );

	it( 'keeps the key passed as the third argument, so list items are not remounted', () => {
		const { jsx } = loadRuntime( undefined );

		const element = jsx( 'li', { children: 'Views' }, 'views' );

		expect( element.key ).toBe( 'views' );
		expect( element.props ).toEqual( { children: 'Views' } );
	} );

	it( 'lets a spread key win over the explicit one, as React does for <Row key="a" {...props} />', () => {
		const { jsx } = loadRuntime( undefined );

		const element = jsx( 'li', { key: 'spread', children: 'Views' }, 'explicit' );

		expect( element.key ).toBe( 'spread' );
	} );

	it( 'renders literal siblings without "unique key" warnings', () => {
		const { jsx, jsxs } = loadRuntime( undefined );
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation( () => {} );

		const element = jsxs( 'p', {
			children: [ jsx( 'strong', { children: 'Views' } ), jsx( 'span', { children: '42' } ) ],
		} );

		expect( renderToStaticMarkup( element ) ).toBe(
			'<p><strong>Views</strong><span>42</span></p>'
		);
		expect( consoleError ).not.toHaveBeenCalled();
		consoleError.mockRestore();
	} );
} );
