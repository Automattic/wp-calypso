/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import Head from '../';

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
} );
