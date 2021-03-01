/**
 * @jest-environment jsdom
 */

/**
 * External Dependencies
 */
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

/**
 * Internal Dependencies
 */
import Experiment, { Variation, DefaultVariation } from '../index';
import { LoadingVariations } from 'calypso/components/experiment';

function renderWithStore( element, initialState ) {
	const store = createStore( ( state ) => state, initialState );
	return {
		...render( <Provider store={ store }>{ element }</Provider> ),
		store,
	};
}

function createState( variation, isLoading ) {
	return {
		experiments: {
			variations: { test: variation },
			isLoading: isLoading,
			anonId: '',
			nextRefresh: Date.now,
		},
	};
}

describe( 'Experiment Component', () => {
	const testComponent = ( state ) =>
		renderWithStore(
			<Experiment name={ 'test' }>
				<DefaultVariation name={ 'a' }>Default</DefaultVariation>
				<Variation name={ 'b' }>Variation B</Variation>
				<LoadingVariations>Is Loading</LoadingVariations>
			</Experiment>,
			state
		);

	test( 'renders a default variation if variation is not set and not loading', () => {
		const { container } = testComponent( createState( undefined, false ) );
		expect( container ).toMatchSnapshot();
	} );

	test( 'renders a default variation if loaded', () => {
		const { container } = testComponent( createState( null, false ) );
		expect( container ).toMatchSnapshot();
	} );

	test( 'renders a variation by name if loaded', () => {
		const { container } = testComponent( createState( 'b', false ) );
		expect( container ).toMatchSnapshot();
	} );

	test( 'renders something while loading if the variation is not defined', () => {
		const { container } = testComponent( createState( undefined, true ) );
		expect( container ).toMatchSnapshot();
	} );

	test( 'assumes variation will not change if already set and reloading variations', () => {
		const { container } = testComponent( createState( 'b', true ) );
		expect( container ).toMatchSnapshot();
	} );
} );
