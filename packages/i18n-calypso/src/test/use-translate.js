/**
 * @jest-environment jsdom
 */

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import i18n, { useTranslate } from '..';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function Label() {
	const translate = useTranslate();
	return translate( 'hook (%(lang)s)', { args: { lang: translate.localeSlug } } );
}

describe( 'useTranslate()', () => {
	let container;
	let root;

	beforeEach( () => {
		// reset to default locale
		act( () => {
			i18n.setLocale();
		} );

		// create container
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( () => {
		// tear down the container
		act( () => {
			root.unmount();
		} );
		document.body.removeChild( container );
		root = null;
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
			root.render( <Label /> );
		} );

		// check that it's translated
		expect( container.textContent ).toBe( 'háček (cs)' );
	} );

	test( 'rerenders after locale change', () => {
		// render with the default locale
		act( () => {
			root.render( <Label /> );
		} );

		expect( container.textContent ).toBe( 'hook (en)' );

		// change locale and ensure that React UI is rerendered
		act( () => {
			i18n.setLocale( {
				'': { localeSlug: 'cs' },
				'hook (%(lang)s)': [ 'háček (%(lang)s)' ],
			} );
		} );

		expect( container.textContent ).toBe( 'háček (cs)' );
	} );

	test( 'rerenders after update of current locale translations', () => {
		// set some locale data
		act( () => {
			i18n.setLocale( {
				'': { localeSlug: 'cs' },
				'hook (%(lang)s)': [ 'háček (%(lang)s)' ],
			} );
		} );

		// render the Label component
		act( () => {
			root.render( <Label /> );
		} );

		// check that it's translated
		expect( container.textContent ).toBe( 'háček (cs)' );

		// update the translations for the current locale
		act( () => {
			i18n.setLocale( {
				'': { localeSlug: 'cs' },
				'hook (%(lang)s)': [ 'hák (%(lang)s)' ],
			} );
		} );

		// check that the rendered translation is updated
		expect( container.textContent ).toBe( 'hák (cs)' );
	} );
} );
