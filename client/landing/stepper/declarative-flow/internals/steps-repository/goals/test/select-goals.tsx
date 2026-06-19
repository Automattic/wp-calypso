/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { Onboard } from '@automattic/data-stores';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { seedManager } from 'calypso/landing/stepper/utils/shuffle-array';
import { SelectGoals } from '../select-goals';

const SiteGoal = Onboard.SiteGoal;

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

	describe( 'hiddenGoals prop', () => {
		it( 'omits goals listed in hiddenGoals from the rendered cards', () => {
			render(
				<SelectGoals
					onChange={ jest.fn() }
					selectedGoals={ [] }
					hiddenGoals={ [ SiteGoal.Write, SiteGoal.SellPhysical ] }
				/>
			);
			const titles = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );
			expect( titles ).not.toContain( 'Publish a blog' );
			expect( titles ).not.toContain( 'Sell physical goods' );
		} );

		it( 'renders the rest of the goals unchanged when hiddenGoals is provided', () => {
			const { rerender } = render( <SelectGoals onChange={ jest.fn() } selectedGoals={ [] } /> );
			const defaultCount = screen.getAllByTestId( 'goal-title' ).length;

			rerender(
				<SelectGoals
					key="with-hidden"
					onChange={ jest.fn() }
					selectedGoals={ [] }
					hiddenGoals={ [ SiteGoal.Write ] }
				/>
			);
			expect( screen.getAllByTestId( 'goal-title' ) ).toHaveLength( defaultCount - 1 );
		} );

		it( 'leaves rendering unchanged when hiddenGoals is omitted', () => {
			const { rerender } = render( <SelectGoals onChange={ jest.fn() } selectedGoals={ [] } /> );
			const baseline = screen.getAllByTestId( 'goal-title' ).length;

			rerender( <SelectGoals key="no-prop" onChange={ jest.fn() } selectedGoals={ [] } /> );
			expect( screen.getAllByTestId( 'goal-title' ) ).toHaveLength( baseline );
		} );
	} );

	describe( 'goalTitles prop', () => {
		it( 'replaces the title for goals listed in goalTitles', () => {
			render(
				<SelectGoals
					onChange={ jest.fn() }
					selectedGoals={ [] }
					goalTitles={ {
						[ SiteGoal.Write ]: 'Start a blog today',
						[ SiteGoal.SellPhysical ]: 'Launch your store',
					} }
				/>
			);
			const titles = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );
			expect( titles ).toContain( 'Start a blog today' );
			expect( titles ).toContain( 'Launch your store' );
			expect( titles ).not.toContain( 'Publish a blog' );
			expect( titles ).not.toContain( 'Sell physical goods' );
		} );

		it( 'leaves the title untouched for goals not present in goalTitles', () => {
			render(
				<SelectGoals
					onChange={ jest.fn() }
					selectedGoals={ [] }
					goalTitles={ { [ SiteGoal.Write ]: 'Start a blog today' } }
				/>
			);
			const titles = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );
			expect( titles ).toContain( 'Start a blog today' );
			expect( titles ).toContain( 'Create a newsletter' );
		} );
	} );

	describe( 'hiddenGoals + goalTitles together', () => {
		it( 'hides one goal and relabels another in the same render', () => {
			render(
				<SelectGoals
					onChange={ jest.fn() }
					selectedGoals={ [] }
					hiddenGoals={ [ SiteGoal.Write ] }
					goalTitles={ { [ SiteGoal.Newsletter ]: 'Start your newsletter' } }
				/>
			);
			const titles = screen.getAllByTestId( 'goal-title' ).map( ( e ) => e.textContent );
			expect( titles ).not.toContain( 'Publish a blog' );
			expect( titles ).toContain( 'Start your newsletter' );
			expect( titles ).not.toContain( 'Create a newsletter' );
		} );
	} );
} );
