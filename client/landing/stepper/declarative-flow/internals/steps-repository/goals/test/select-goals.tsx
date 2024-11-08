/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { seedManager } from 'calypso/landing/stepper/utils/shuffle-array';
import { SelectGoals } from '../select-goals';

beforeEach( () => {
	jest.spyOn( global.Math, 'random' ).mockReturnValue( 0.12345 );
} );

afterEach( () => {
	jest.spyOn( global.Math, 'random' ).mockRestore();
} );

describe( 'SelectGoals', () => {
	it( 'preserves goals order on page refresh', () => {
		const { rerender } = render(
			<SelectGoals onChange={ jest.fn() } selectedGoals={ [] } isAddedGoalsExp />
		);
		const firstRenderGoals = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );

		// I'm simulating a page load by rerendering the component with a different key.
		rerender(
			<SelectGoals
				key="second-instance"
				onChange={ jest.fn() }
				selectedGoals={ [] }
				isAddedGoalsExp
			/>
		);
		const secondRenderGoals = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );

		expect( firstRenderGoals ).toEqual( secondRenderGoals );
	} );

	it( 'randomizes goals between sessions', () => {
		const { rerender } = render(
			<SelectGoals onChange={ jest.fn() } selectedGoals={ [] } isAddedGoalsExp />
		);
		const firstRenderGoals = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );

		seedManager.clearSeed();

		// Guarantee goals will have a different order (for testing purposes).
		jest.spyOn( global.Math, 'random' ).mockReturnValue( 0.98765 );

		// I'm simulating a page load by rerendering the component with a different key.
		rerender(
			<SelectGoals
				key="second-instance"
				onChange={ jest.fn() }
				selectedGoals={ [] }
				isAddedGoalsExp
			/>
		);
		const secondRenderGoals = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );

		expect( firstRenderGoals ).not.toEqual( secondRenderGoals );
	} );
} );
