/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { StreakBadge } from '../index';

describe( 'StreakBadge', () => {
	test( 'should render the streak number', () => {
		render( <StreakBadge streak={ 5 } state="active-engaged" /> );

		expect( screen.getByText( '5' ) ).toBeVisible();
	} );

	test( 'should render the "Day streak" label', () => {
		render( <StreakBadge streak={ 5 } state="active-engaged" /> );

		expect( screen.getByText( 'Day streak' ) ).toBeVisible();
	} );

	test.each( [
		[ 'active-engaged', '.streak-badge.is-active-engaged' ],
		[ 'active-pending', '.streak-badge.is-active-pending' ],
		[ 'inactive', '.streak-badge.is-inactive' ],
		[ 'frozen', '.streak-badge.is-frozen' ],
	] as const )( 'should apply the %s state class', ( state, selector ) => {
		const { container } = render( <StreakBadge streak={ 7 } state={ state } /> );

		expect( container.querySelector( selector ) ).toBeInTheDocument();
	} );
} );
