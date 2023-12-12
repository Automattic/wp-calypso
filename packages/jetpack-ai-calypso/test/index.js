/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
/**
 * Internal dependencies
 */
import { GeneratorModal } from '../src';

describe( 'Base', () => {
	it( 'should render Hello World', async () => {
		render( <GeneratorModal /> );
		expect( await screen.findByText( 'Hello World' ) ).toBeInTheDocument();
	} );
} );
