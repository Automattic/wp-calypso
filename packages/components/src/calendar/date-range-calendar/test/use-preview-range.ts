/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { addDays, subDays } from 'date-fns';
import { usePreviewRange } from '../';

describe( 'usePreviewRange', () => {
	const today = new Date( '2024-03-15' );
	const tomorrow = addDays( today, 1 );
	const yesterday = subDays( today, 1 );
	const nextWeek = addDays( today, 7 );

	it( 'should return undefined when there is no hovered date', () => {
		const { result } = renderHook( () =>
			usePreviewRange( {
				selected: { from: today, to: tomorrow },
				hoveredDate: undefined,
			} )
		);

		expect( result.current ).toBeUndefined();
	} );

	it( 'should return undefined when there is no selected date', () => {
		const { result } = renderHook( () =>
			usePreviewRange( {
				selected: undefined,
				hoveredDate: today,
			} )
		);

		expect( result.current ).toBeUndefined();
	} );

	it( 'should return undefined when there is no selected start date', () => {
		const { result } = renderHook( () =>
			usePreviewRange( {
				selected: { from: undefined, to: tomorrow },
				hoveredDate: today,
			} )
		);

		expect( result.current ).toBeUndefined();
	} );

	it( 'should show preview when hovering before selected range', () => {
		const { result } = renderHook( () =>
			usePreviewRange( {
				selected: { from: today, to: tomorrow },
				hoveredDate: yesterday,
			} )
		);

		expect( result.current ).toEqual( {
			from: yesterday,
			to: today,
		} );
	} );

	it( 'should show preview when hovering between selected range dates', () => {
		const { result } = renderHook( () =>
			usePreviewRange( {
				selected: { from: yesterday, to: tomorrow },
				hoveredDate: today,
			} )
		);

		expect( result.current ).toEqual( {
			from: yesterday,
			to: today,
		} );
	} );

	it( 'should show preview when hovering after selected range', () => {
		const { result } = renderHook( () =>
			usePreviewRange( {
				selected: { from: yesterday, to: today },
				hoveredDate: tomorrow,
			} )
		);

		expect( result.current ).toEqual( {
			from: today,
			to: tomorrow,
		} );
	} );

	it( 'should show preview when hovering after selected range with no end date', () => {
		const { result } = renderHook( () =>
			usePreviewRange( {
				selected: { from: today },
				hoveredDate: tomorrow,
			} )
		);

		expect( result.current ).toEqual( {
			from: today,
			to: tomorrow,
		} );
	} );

	describe( 'min range constraint', () => {
		it( 'should collapse preview to single date when range is less than min', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: today },
					hoveredDate: tomorrow,
					min: 3,
				} )
			);

			expect( result.current ).toEqual( {
				from: tomorrow,
				to: tomorrow,
			} );
		} );

		it( 'should allow preview when range meets min requirement', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: today },
					hoveredDate: nextWeek,
					min: 3,
				} )
			);

			expect( result.current ).toEqual( {
				from: today,
				to: nextWeek,
			} );
		} );
	} );

	describe( 'max range constraint', () => {
		it( 'should collapse preview to single date when range exceeds max', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: today },
					hoveredDate: nextWeek,
					max: 3,
				} )
			);

			expect( result.current ).toEqual( {
				from: nextWeek,
				to: nextWeek,
			} );
		} );

		it( 'should allow preview when range meets max requirement', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: today },
					hoveredDate: tomorrow,
					max: 3,
				} )
			);

			expect( result.current ).toEqual( {
				from: today,
				to: tomorrow,
			} );
		} );
	} );

	describe( 'disabled dates', () => {
		it( 'should collapse preview to single date when range contains disabled dates and excludeDisabled is true', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: today },
					hoveredDate: nextWeek,
					disabled: [ tomorrow ],
					excludeDisabled: true,
				} )
			);

			expect( result.current ).toEqual( {
				from: nextWeek,
				to: nextWeek,
			} );
		} );

		it( 'should allow preview when range contains disabled dates but excludeDisabled is false', () => {
			const { result } = renderHook( () =>
				usePreviewRange( {
					selected: { from: today },
					hoveredDate: nextWeek,
					disabled: [ tomorrow ],
					excludeDisabled: false,
				} )
			);

			expect( result.current ).toEqual( {
				from: today,
				to: nextWeek,
			} );
		} );
	} );
} );
