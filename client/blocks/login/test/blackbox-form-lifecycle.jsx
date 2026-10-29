/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Fragment } from 'react';
import { useBlackboxProtection } from '../use-blackbox-protection';
import { createBlackboxInstance } from '../utils/__mocks__/blackbox-instance';
import { getBlackboxSessionId } from '../utils/get-blackbox-session-id';

jest.mock( '@automattic/calypso-config', () => ( { isEnabled: () => true } ) );
jest.mock( '../utils/blackbox-sdk', () => ( {
	getBlackboxApiKey: ( feature ) => feature,
	loadBlackboxSdk: jest.fn( () => Promise.resolve() ),
} ) );

function TestForm( {
	layout = 'wide',
	suspended = false,
	feature = 'checkout-key',
	direct = false,
	onResult,
	onSubmit,
} ) {
	const { challenge, getSessionId, isSubmitBlocked } = useBlackboxProtection( {
		feature,
		suspended,
	} );
	const submit = async () => {
		const sessionId = await ( direct ? getBlackboxSessionId( feature ) : getSessionId() );
		onResult( sessionId );
		if ( sessionId !== null ) {
			onSubmit( sessionId );
		}
	};
	return (
		<>
			<Fragment key={ layout }>{ challenge }</Fragment>
			<button disabled={ isSubmitBlocked } onClick={ submit }>
				Submit
			</button>
		</>
	);
}

describe( 'Blackbox form lifetime', () => {
	let sdk;
	let finishFlush;
	let onResult;
	let onSubmit;
	beforeEach( () => {
		jest.useFakeTimers();
		sdk = createBlackboxInstance( { status: 'loading' } );
		window.Blackbox = sdk.api;
		sdk.api.flush.mockImplementation(
			() =>
				new Promise( ( resolve ) => {
					finishFlush = resolve;
				} )
		);
		onResult = jest.fn();
		onSubmit = jest.fn();
	} );
	afterEach( () => {
		delete window.Blackbox;
		jest.useRealTimers();
	} );

	async function startSubmission( props = {} ) {
		const formProps = { onResult, onSubmit, ...props };
		const view = render( <TestForm { ...formProps } /> );
		await act( async () => {} );
		act( () => jest.advanceTimersByTime( 5000 ) );
		fireEvent.click( screen.getByRole( 'button' ) );
		await act( async () => {} );
		return { ...view, formProps };
	}

	test.each( [ false, true ] )(
		'continues after a layout remount (direct caller: %s)',
		async ( direct ) => {
			const { rerender, formProps } = await startSubmission( { direct } );
			rerender( <TestForm { ...formProps } layout="narrow" /> );
			await act( async () => {} );
			expect( onResult ).not.toHaveBeenCalled();

			await act( async () => {
				sdk.setState( { status: 'ready', sessionId: 'replacement' } );
				finishFlush( { sessionId: 'replacement', challengePending: false, outcome: 'ok' } );
			} );
			expect( onSubmit ).toHaveBeenCalledTimes( 1 );
			expect( onSubmit ).toHaveBeenCalledWith( 'replacement' );
		}
	);

	test( 'does not cancel direct callers after the last form unmounts', async () => {
		const { unmount } = render( <TestForm onResult={ onResult } onSubmit={ onSubmit } /> );
		unmount();
		sdk.api.flush.mockResolvedValue( { sessionId: 'sid', challengePending: false, outcome: 'ok' } );
		sdk.setState( { status: 'ready', sessionId: 'sid' } );

		await expect( getBlackboxSessionId( 'signup-key' ) ).resolves.toBe( 'sid' );
	} );

	test( 'keeps an earlier form usable while a later form is mounted and after it unmounts', async () => {
		const first = { onResult, onSubmit };
		const second = { onResult: jest.fn(), onSubmit: jest.fn() };
		const { rerender } = render(
			<>
				<TestForm { ...first } />
				<TestForm { ...second } />
			</>
		);
		sdk.api.flush.mockResolvedValue( { sessionId: 'sid', challengePending: false, outcome: 'ok' } );
		await act( async () => {} );
		act( () => jest.advanceTimersByTime( 5000 ) );
		act( () => sdk.setState( { status: 'ready', sessionId: 'sid' } ) );

		fireEvent.click( screen.getAllByRole( 'button' )[ 0 ] );
		await act( async () => {} );
		expect( onSubmit ).toHaveBeenCalledWith( 'sid' );

		rerender( <TestForm { ...first } direct /> );
		fireEvent.click( screen.getByRole( 'button' ) );
		await act( async () => {} );
		expect( onSubmit ).toHaveBeenCalledTimes( 2 );
	} );

	test.each( [
		[ 'unmount', 'flush' ],
		[ 'suspend', 'flush' ],
		[ 'key change', 'flush' ],
		[ 'unmount', 'challenge' ],
		[ 'suspend', 'challenge' ],
		[ 'key change', 'challenge' ],
	] )( 'cancels on %s during %s', async ( action, stage ) => {
		const { rerender, unmount, formProps } = await startSubmission();
		if ( stage === 'challenge' ) {
			await act( async () => {
				sdk.setState( { status: 'challenge', sessionId: 'sid' } );
				finishFlush( { sessionId: 'sid', challengePending: true, outcome: 'ok' } );
			} );
		}
		if ( action === 'unmount' ) {
			unmount();
		} else {
			rerender(
				<TestForm
					{ ...formProps }
					suspended={ action === 'suspend' }
					feature={ action === 'key change' ? 'signup-key' : 'checkout-key' }
				/>
			);
		}
		await act( async () => {} );
		expect( onResult ).toHaveBeenCalledWith( null );
		await act( async () => {
			sdk.setState( { status: 'ready', sessionId: 'replacement' } );
			finishFlush( { sessionId: 'replacement', challengePending: false, outcome: 'ok' } );
		} );
		expect( onSubmit ).not.toHaveBeenCalled();
	} );
} );
