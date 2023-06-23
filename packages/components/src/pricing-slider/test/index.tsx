/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PricingSlider from '../index';

describe( 'PricingSlider', () => {
	beforeAll( () => {
		global.ResizeObserver = require( 'resize-observer-polyfill' );
	} );
	it( 'renders the pricing slider', () => {
		render( <PricingSlider /> );
		expect( screen.getByTestId( 'pricing-slider' ) ).toBeInTheDocument();
	} );
} );
