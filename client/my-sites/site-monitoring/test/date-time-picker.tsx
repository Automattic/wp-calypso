/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import moment from 'moment';
import { DateTimePicker } from '../components/site-logs-toolbar/date-time-picker';

test( `display values in the specified timezone`, () => {
	const { rerender } = render(
		<DateTimePicker
			data-testid="input"
			value={ moment( '2023-07-28T03:13:13Z' ) }
			gmtOffset={ +12 }
			onChange={ () => undefined }
		/>
	);

	expect( screen.getByTestId( 'input' ) ).toHaveAttribute( 'value', '2023-07-28T15:13:13' );

	rerender(
		<DateTimePicker
			data-testid="input"
			value={ moment( '2023-07-28T03:13:13+05' ) }
			gmtOffset={ +4 }
			onChange={ () => undefined }
		/>
	);

	expect( screen.getByTestId( 'input' ) ).toHaveAttribute( 'value', '2023-07-28T02:13:13' );
} );

test( `values returned by onChange use the same timezone used by the value prop`, () => {
	const handleChange = jest.fn();

	const { rerender } = render(
		<DateTimePicker
			data-testid="input"
			value={ moment( '2023-07-28T03:00:00Z' ).utcOffset( 0 ) }
			gmtOffset={ +10 }
			onChange={ handleChange }
		/>
	);

	fireEvent.change( screen.getByTestId( 'input' ), {
		target: { value: '2023-07-28T14:00:00' },
	} );

	expect( handleChange ).toHaveBeenCalledTimes( 1 );
	expect( handleChange.mock.lastCall[ 0 ].unix() ).toBe( moment( '2023-07-28T04:00:00Z' ).unix() );
	expect( handleChange.mock.lastCall[ 0 ].utcOffset() ).toBe( 0 );

	rerender(
		<DateTimePicker
			data-testid="input"
			value={ moment( '2023-07-28T03:00:00+05' ).utcOffset( 5 * 60 ) } // utcOffset uses minutes
			gmtOffset={ +4 }
			onChange={ handleChange }
		/>
	);

	fireEvent.change( screen.getByTestId( 'input' ), {
		target: { value: '2023-07-28T03:00:00' },
	} );

	expect( handleChange ).toHaveBeenCalledTimes( 2 );
	expect( handleChange.mock.lastCall[ 0 ].unix() ).toBe(
		moment( '2023-07-28T04:00:00+05' ).unix()
	);
	expect( handleChange.mock.lastCall[ 0 ].utcOffset() ).toBe( 5 * 60 );
} );
