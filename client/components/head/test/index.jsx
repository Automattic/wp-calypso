/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import Head from '../';

describe( 'Head', () => {
	test( 'should render default title', () => {
		render( <Head /> );
		expect( screen.queryByText( 'WordPress.com' ) ).toBeInTheDocument();
	} );

	test( 'should render custom title', () => {
		const title = 'Arbitrary Custom Title';
		render( <Head title={ title } /> );
		expect( screen.queryByText( title ) ).toBeInTheDocument();
	} );
} );
