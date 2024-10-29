/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SelectGoals } from '../select-goals';

describe( 'SelectGoals', () => {
	it( 'preserves goals order on page refresh', () => {
		const { rerender } = render( <SelectGoals onChange={ jest.fn() } selectedGoals={ [] } /> );
		const firstRenderGoals = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );

		// I'm simulating a page load by rerendering the component with a different key.
		rerender( <SelectGoals key="second-instance" onChange={ jest.fn() } selectedGoals={ [] } /> );
		const secondRenderGoals = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );

		expect( firstRenderGoals ).toEqual( secondRenderGoals );
	} );

	it( 'randomizes goals between sessions', () => {
		const { rerender } = render( <SelectGoals onChange={ jest.fn() } selectedGoals={ [] } /> );
		const firstRenderGoals = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );

		sessionStorage.clear();

		// I'm simulating a page load by rerendering the component with a different key.
		rerender( <SelectGoals key="second-instance" onChange={ jest.fn() } selectedGoals={ [] } /> );
		const secondRenderGoals = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );

		expect( firstRenderGoals ).not.toEqual( secondRenderGoals );
	} );
} );
