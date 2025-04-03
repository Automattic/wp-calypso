/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import React from 'react';
import PlaygroundStep from '..';
import { StepProps } from '../../../types';
import { renderStep, mockStepProps, RenderStepOptions } from '../../test/helpers';

const render = ( props?: Partial< StepProps >, renderOptions?: RenderStepOptions ) => {
	const combinedProps = { ...mockStepProps( props ) };

	return renderStep( <PlaygroundStep { ...combinedProps } />, renderOptions );
};

describe( 'Playground Step', () => {
	it( 'should render the launch button', () => {
		render();
		expect( screen.getByRole( 'button', { name: 'Launch on WordPress.com' } ) ).toBeInTheDocument();
	} );
} );
