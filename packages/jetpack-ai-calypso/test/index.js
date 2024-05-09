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
	it( 'should render modal header', async () => {
		render( <GeneratorModal isOpen /> );
		expect( await screen.findByText( 'Jetpack AI Logo Generator' ) ).toBeInTheDocument();
	} );
} );
