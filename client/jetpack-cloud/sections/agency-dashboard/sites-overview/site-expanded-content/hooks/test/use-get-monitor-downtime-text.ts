/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useGetMonitorDowntimeText from '../use-get-monitor-downtime-text';

const getResult = ( downtime: number | undefined ) => {
	const {
		result: { current: getMonitorDowntimeText },
	} = renderHook( () => useGetMonitorDowntimeText() );

	return getMonitorDowntimeText( downtime );
};

describe( 'useGetMonitorDowntimeText', () => {
	it( 'should return "Downtime" when given undefined downtime', () => {
		expect( getResult( undefined ) ).toEqual( 'Downtime' );
	} );

	it( 'should return the correct text for a high downtime value for 1 day', () => {
		const ONE_DAY = 24 * 60;
		expect( getResult( ONE_DAY ) ).toEqual( 'Downtime for 1d' );
	} );

	it( 'should return the correct text for a moderate downtime value only in hours', () => {
		const TWO_HOURS = 2 * 60;
		expect( getResult( TWO_HOURS ) ).toEqual( 'Downtime for 2h' );
	} );

	it( 'should return the correct text for a moderate downtime value in hours and min', () => {
		const TWO_HOURS_THIRTY = 2 * 60 + 30;
		expect( getResult( TWO_HOURS_THIRTY ) ).toEqual( 'Downtime for 2h 30m' );
	} );

	it( 'should return the correct text for a low downtime value', () => {
		const TWENTY_MINUTES = 20;
		expect( getResult( TWENTY_MINUTES ) ).toEqual( 'Downtime for 20m' );
	} );
} );
