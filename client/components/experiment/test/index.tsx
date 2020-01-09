/**
 * @jest-environment jsdom
 */

/**
 * External Dependencies
 */
import React from 'react';
import { render } from '@testing-library/react';

import { Variation, DefaultVariation, RawExperiment } from '../index';
import { LoadingVariations } from 'components/experiment';

describe( 'Experiment Component', () => {
	const testComponent = ( variation?: string, loading = false ) => (
		<RawExperiment name={ 'test' } variation={ variation } isLoading={ loading }>
			<DefaultVariation name={ 'a' }>Default</DefaultVariation>
			<Variation name={ 'b' }>Variation B</Variation>
			<LoadingVariations>Is Loading</LoadingVariations>
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

	test( 'renders something while loading', () => {
		const { container } = render( testComponent( undefined, true ) );
		expect( container ).toMatchSnapshot();
	} );

	test( 'assumes variation will not change if already set', () => {
		const { container } = render( testComponent( 'b', true ) );
		expect( container ).toMatchSnapshot();
	} );
} );
