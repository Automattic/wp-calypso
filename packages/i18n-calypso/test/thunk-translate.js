/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React, { createElement, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

/**
 * Internal dependencies
 */
import i18n, { thunk } from '../src';

describe( 'thunk.translate()', () => {
	let container;

	beforeEach( () => {
		// reset to default locale
		i18n.setLocale();

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

		const Translation = thunk.translate( 'hook (%(lang)s)', {
			args: { lang: i18n.getLocaleSlug() },
		} );

		// render the translation
		act( () => {
			ReactDOM.render( <Translation />, container );
		} );

		// check that it's translated
		expect( container.textContent ).toBe( 'háček (cs)' );
	} );

	test( 'rerenders after locale change', () => {
		// render with the default locale
		const Translation = thunk.translate( 'hook (%(lang)s)', { args: { lang: 'static example' } } );

		act( () => {
			ReactDOM.render(
				<div>
					<Translation />
				</div>,
				container
			);
		} );

		expect( container.textContent ).toBe( 'hook (static example)' );

		// change locale and ensure that React UI is rerendered
		act( () => {
			i18n.setLocale( {
				'': { localeSlug: 'cs' },
				'hook (%(lang)s)': [ 'háček (%(lang)s)' ],
			} );
		} );

		expect( container.textContent ).toBe( 'háček (static example)' );
	} );

	test( 'recalculates thunked arguments after locale change', () => {
		// render with the default locale
		const Translation = thunk.translate( 'hook (%(lang)s)', () => ( {
			args: { lang: i18n.getLocaleSlug() },
		} ) );

		act( () => {
			ReactDOM.render( <Translation />, container );
		} );

		expect( container.textContent ).toBe( 'hook (en)' );

		// change locale and ensure that React UI is rerendered
		act( () => {
			i18n.setLocale( {
				'': { localeSlug: 'dynamic' },
				'hook (%(lang)s)': [ 'háček (%(lang)s)' ],
			} );
		} );

		expect( container.textContent ).toBe( 'háček (dynamic)' );
	} );

	test( 'rerenders after update of current locale translations', () => {
		// set some locale data
		i18n.setLocale( {
			'': { localeSlug: 'cs' },
			'hook (%(lang)s)': [ 'háček (%(lang)s)' ],
		} );

		const HookTranslation = thunk.translate( 'hook (%(lang)s)', () => ( {
			args: { lang: i18n.getLocaleSlug() },
		} ) );

		// render the translation
		act( () => {
			ReactDOM.render( <HookTranslation />, container );
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

	test( 'rerenders iteratively', () => {
		// set some locale data
		i18n.setLocale( {
			'': { localeSlug: 'cs' },
			String0: [ 'řada0' ],
			String1: [ 'řada1' ],
			String2: [ 'řada2' ],
		} );

		const myStrings = [
			thunk.translate( 'String0', { comment: 'other i18n options go here' } ),
			thunk.translate( 'String1' ),
			thunk.translate( 'String2' ),
		];

		// render the translation
		act( () => {
			// Syntax needs a lot of work :p
			ReactDOM.render(
				createElement( Fragment, null, ...myStrings.map( createElement ) ),
				container
			);
		} );

		// check that it's translated
		expect( container.textContent ).toBe( 'řada0řada1řada2' );

		// update the translations for the current locale
		act( () => {
			i18n.setLocale( {
				'': { localeSlug: 'cs' },
				String0: [ '+řada0' ],
				String1: [ '+řada1' ],
				String2: [ '+řada2' ],
			} );
		} );

		// check that the rendered translation is updated
		expect( container.textContent ).toBe( '+řada0+řada1+řada2' );
	} );
} );
