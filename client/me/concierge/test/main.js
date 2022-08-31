/** @jest-environment jsdom */
jest.mock( '../shared/upsell', () => () => <div data-testid="upsell" /> );
jest.mock( '../shared/no-available-times', () => () => <div data-testid="no-available-times" /> );
jest.mock( 'calypso/me/reauth-required', () => () => null );

import { screen } from '@testing-library/react';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ConciergeMain } from '../main';

const render = ( el, options ) => renderWithProvider( el, { ...options, reducers: { ui } } );

const StepOne = () => <div data-testid="step-1" />;
const Skeleton = () => <div data-testid="skeleton" />;

const props = {
	steps: [ StepOne ],
	availableTimes: [
		1541506500000, 1541508300000, 1541510100000, 1541511900000, 1541513700000, 1541515500000,
		1541516400000,
	],
	site: {
		plan: {},
	},
	userSettings: {},
	skeleton: Skeleton,
	analyticsPath: '/arbitrary/analytics-path',
	analyticsTitle: 'arbitrary analytics title',
};

describe( 'ConciergeMain basic tests', () => {
	test( 'should not blow up', () => {
		render( <ConciergeMain { ...props } /> );
		expect( screen.getByRole( 'main' ) ).toBeVisible();
	} );

	test( 'should short-circuit to <Skeleton /> when data is insufficient to render anything else', () => {
		const { rerender } = render( <ConciergeMain { ...props } availableTimes={ null } /> );
		expect( screen.queryByTestId( 'skeleton' ) ).toBeVisible();

		rerender( <ConciergeMain { ...props } site={ null } /> );
		expect( screen.queryByTestId( 'skeleton' ) ).toBeVisible();

		rerender( <ConciergeMain { ...props } site={ { plan: null } } /> );
		expect( screen.queryByTestId( 'skeleton' ) ).toBeVisible();

		rerender( <ConciergeMain { ...props } userSettings={ null } /> );
		expect( screen.queryByTestId( 'skeleton' ) ).toBeVisible();
	} );
} );

describe( 'ConciergeMain.render()', () => {
	test( 'Should render upsell for non-eligible users', () => {
		render( <ConciergeMain { ...props } scheduleId={ 0 } /> );
		expect( screen.queryByTestId( 'upsell' ) ).toBeVisible();
		expect( screen.queryByTestId( 'step-1' ) ).not.toBeInTheDocument();
	} );

	test( 'Should render NoAvailableTimes if no times are available.', () => {
		const propsWithoutAvailableTimes = { ...props, availableTimes: [] };
		render(
			<ConciergeMain
				{ ...propsWithoutAvailableTimes }
				scheduleId={ 1 }
				site={ { plan: { product_slug: 'a-plan' } } }
			/>
		);
		expect( screen.queryByTestId( 'no-available-times' ) ).toBeVisible();
	} );

	test( 'Should render CurrentStep for eligible users', () => {
		render(
			<ConciergeMain { ...props } scheduleId={ 1 } site={ { plan: { product_slug: 'a-plan' } } } />
		);
		expect( screen.queryByTestId( 'upsell' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'step-1' ) ).toBeVisible();
	} );
} );
