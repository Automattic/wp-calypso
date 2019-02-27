/**
 * External dependencies
 */
import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';

/**
 * Internal dependencies
 */
import i18n, { useTranslate } from '../src';

function Label() {
	const [ translate, lang ] = useTranslate();
	return translate( 'hook (%(lang)s)', { args: { lang } } );
}

describe( 'useTranslate()', () => {
	test( 'renders a translated string', () => {
		// set some locale data
		i18n.setLocale( {
			'': { localeSlug: 'cs' },
			'hook (%(lang)s)': [ 'háček (%(lang)s)' ],
		} );

		// render the Label component
		const renderer = new ShallowRenderer();
		renderer.render( <Label /> );

		// check that it's translated
		expect( renderer.getRenderOutput() ).toBe( 'háček (cs)' );
	} );
} );
