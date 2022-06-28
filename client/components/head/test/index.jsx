/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import renderer from 'react-test-renderer';
import Head from '../';

describe( 'Head', () => {
	test( 'should render default title', () => {
		render( <Head /> );
		expect( screen.getByText( 'WordPress.com' ) ).toBeInTheDocument();
		expect( screen.getByText( 'WordPress.com' ) ).not.toBeVisible();
		const tree = renderer.create( <Head /> ).toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'should render custom title', () => {
		const title = 'Arbitrary Custom Title';
		render( <Head title={ title } /> );
		expect( screen.getByText( title ) ).toBeInTheDocument();
		expect( screen.getByText( title ) ).not.toBeVisible();
		const tree = renderer.create( <Head /> ).toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
