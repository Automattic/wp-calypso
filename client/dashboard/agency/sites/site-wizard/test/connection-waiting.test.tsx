/**
 * @jest-environment jsdom
 */
import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import ConnectionWaiting from '../connection-waiting';

test( 'cancels a pending connection check when leaving the waiting screen', async () => {
	jest.useFakeTimers();
	try {
		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		const onCheck = jest.fn();
		const { unmount } = render(
			<ConnectionWaiting
				sites={ [
					{ id: 'one.example', name: 'One', url: 'https://one.example', staging: false },
					{ id: 'two.example', name: 'Two', url: 'https://two.example', staging: false },
				] }
				plugin="a4a"
				hasChecked={ false }
				onCheck={ onCheck }
			/>
		);
		await user.click( screen.getByRole( 'button', { name: 'Check connection' } ) );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Checking connection…' );
		unmount();
		act( () => jest.advanceTimersByTime( 1000 ) );
		expect( onCheck ).not.toHaveBeenCalled();
	} finally {
		jest.useRealTimers();
	}
} );
