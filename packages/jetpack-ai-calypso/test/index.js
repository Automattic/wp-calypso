/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
/**
 * Internal dependencies
 */
import { GeneratorModal } from '../src';

describe( 'Base', () => {
	it( 'should render Hello World', async () => {
		render( <GeneratorModal isOpen={ true } /> );
		expect( await screen.findByText( 'Hello World' ) ).toBeInTheDocument();
	} );
} );
