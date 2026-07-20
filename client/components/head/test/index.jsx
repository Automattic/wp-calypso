/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import Head from '../';

const restProxyHref = 'https://public-api.wordpress.com/wp-admin/rest-proxy/?v=2.0';

describe( 'Head', () => {
	test( 'should render default title', () => {
		render( <Head /> );
		// React 18 renders `<title>` in the container; React 19 hoists it into
		// the document head. Query the document for the `<title>` element so this
		// works under both versions.
		expect( document.querySelector( 'title' )?.textContent ).toBe( 'WordPress.com' );
	} );

	test( 'should render custom title', () => {
		const title = 'Arbitrary Custom Title';
		render( <Head title={ title } /> );
		expect( document.querySelector( 'title' )?.textContent ).toBe( title );
	} );

	test( 'should prefetch the REST proxy by default', () => {
		render( <Head /> );
		expect(
			document.querySelector( `link[rel="prefetch"][href="${ restProxyHref }"]` )
		).toBeTruthy();
	} );

	test( 'should skip the REST proxy prefetch when disabled', () => {
		render( <Head shouldPrefetchRestProxy={ false } /> );
		expect(
			document.querySelector( `link[rel="prefetch"][href="${ restProxyHref }"]` )
		).toBeNull();
	} );
} );
