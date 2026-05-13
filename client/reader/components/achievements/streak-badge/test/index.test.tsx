/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { StreakBadge } from '../index';

describe( 'StreakBadge', () => {
	test( 'should render the streak number', () => {
		render( <StreakBadge streak={ 5 } state="active" /> );

		expect( screen.getByText( '5' ) ).toBeVisible();
	} );

	test( 'should render the "Activity Streak" label', () => {
		render( <StreakBadge streak={ 5 } state="active" /> );

		expect( screen.getByText( 'Activity Streak' ) ).toBeVisible();
	} );

	test.each( [
		[ 'inactive', '.streak-badge.is-inactive' ],
		[ 'active', '.streak-badge.is-active' ],
		[ 'longest-active', '.streak-badge.is-longest-active' ],
	] as const )( 'should apply the %s state class', ( state, selector ) => {
		const { container } = render( <StreakBadge streak={ 7 } state={ state } /> );

		expect( container.querySelector( selector ) ).toBeInTheDocument();
	} );
} );
