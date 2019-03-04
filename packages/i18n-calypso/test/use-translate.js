/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

/**
 * Internal dependencies
 */
import i18n, { useTranslate } from '../src';

function Label() {
	const translate = useTranslate();
	return translate( 'hook (%(lang)s)', { args: { lang: translate.localeSlug } } );
}

describe( 'useTranslate()', () => {
	let container;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		ReactDOM.unmountComponentAtNode( container );
		document.body.removeChild( container );
		container = null;
	} );

	test( 'renders a translated string', () => {
		// set some locale data
		i18n.setLocale( {
			'': { localeSlug: 'cs' },
			'hook (%(lang)s)': [ 'háček (%(lang)s)' ],
		} );

		// render the Label component
		act( () => {
			ReactDOM.render( <Label />, container );
		} );

		// check that it's translated
		expect( container.textContent ).toBe( 'háček (cs)' );
	} );
} );
