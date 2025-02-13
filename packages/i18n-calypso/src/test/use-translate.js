/**
 * @jest-environment jsdom
 */

import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import i18n, { useTranslate } from '..';

function Label() {
	const translate = useTranslate();
	return translate( 'hook (%(lang)s)', { args: { lang: translate.localeSlug } } );
}

describe( 'useTranslate()', () => {
	let container;

	beforeEach( () => {
		// reset to default locale
		act( () => {
			i18n.setLocale();
		} );

		// create container
		container = document.createElement( 'div' );
		document.body.appendChild( container );
	} );

	afterEach( () => {
		// tear down the container
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

	test( 'rerenders after locale change', () => {
		// render with the default locale
		act( () => {
			ReactDOM.render( <Label />, container );
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
			ReactDOM.render( <Label />, container );
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
