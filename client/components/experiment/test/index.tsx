/**
 * @jest-environment jsdom
 */

/**
 * External Dependencies
 */
import React from 'react';
import { render } from '@testing-library/react';

import { Variation, DefaultVariation, RawExperiment } from '../index';

describe( 'Experiment Component', () => {
	const testComponent = ( variation?: string ) => (
		<RawExperiment name={ 'test' } variation={ variation }>
			<DefaultVariation name={ 'a' }>Default</DefaultVariation>
			<Variation name={ 'b' }>Variation B</Variation>
		</RawExperiment>
	);

	test( 'renders a default variation', () => {
		const { container } = render( testComponent( undefined ) );
		expect( container ).toMatchSnapshot();
	} );

	test( 'renders a default variation by name', () => {
		const { container } = render( testComponent( 'a' ) );
		expect( container ).toMatchSnapshot();
	} );

	test( 'renders a variation by name', () => {
		const { container } = render( testComponent( 'b' ) );
		expect( container ).toMatchSnapshot();
	} );
} );
