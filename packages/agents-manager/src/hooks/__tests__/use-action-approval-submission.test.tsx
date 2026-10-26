/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useActionApprovalSubmission } from '../use-action-approval-submission';
import type { ActionApproval } from '../../utils/action-approvals';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: ( text: string ) => text,
} ) );
jest.mock( '../../components/action-approval-card', () => ( { ActionApprovalCard: () => null } ) );

const PENDING: ActionApproval = {
	toolCallId: 'toolu_abc',
	toolId: 'wpcom__plugins',
	proposalId: 123,
	arguments: {},
	status: 'pending',
	timestamp: 20,
};

type SubmitContextMessage = Parameters<
	typeof useActionApprovalSubmission
>[ 0 ][ 'submitContextMessage' ];

function mockSubmit( implementation: SubmitContextMessage ) {
	return jest.fn< ReturnType< SubmitContextMessage >, Parameters< SubmitContextMessage > >(
		implementation
	);
}

function renderSubmission( {
	approval = PENDING,
	submitContextMessage = mockSubmit( async ( _message, _options, onDispatch ) => {
		onDispatch?.();
	} ),
}: {
	approval?: ActionApproval;
	submitContextMessage?: ReturnType< typeof mockSubmit >;
} = {} ) {
	let current = approval;
	const streamGeneration = Symbol();
	const updateApproval = jest.fn(
		(
			_toolCallId: string,
			patch: Partial< ActionApproval > | ( ( a: ActionApproval ) => Partial< ActionApproval > )
		) => {
			current = { ...current, ...( typeof patch === 'function' ? patch( current ) : patch ) };
		}
	);
	const hook = renderHook( () =>
		useActionApprovalSubmission( {
			approvals: new Map( [ [ current.toolCallId, current ] ] ),
			updateApproval,
			submitContextMessage,
			isProcessing: false,
			streamGeneration,
		} )
	);

	const decide = async ( decision: 'allow' | 'decline' ) => {
		const [ card ] = hook.result.current
			.withActionApprovalCards( [] )
			.flatMap( ( message ) => message.content );
		await act( async () => {
			await card.componentProps.onDecide( decision );
		} );
	};

	return { hook, decide, submitContextMessage, updateApproval, getApproval: () => current };
}

describe( 'useActionApprovalSubmission', () => {
	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it.each( [
		[ 'allow', '/approve 123' ],
		[ 'decline', '/decline 123' ],
	] as const )( 'sends %s as the hidden command %s', async ( decision, command ) => {
		const { decide, submitContextMessage } = renderSubmission();

		await decide( decision );

		expect( submitContextMessage ).toHaveBeenCalledWith(
			command,
			{ type: 'command' },
			expect.any( Function )
		);
	} );

	it( 'marks the card as sending once the answer goes out', async () => {
		const { decide, updateApproval } = renderSubmission();

		await decide( 'allow' );

		expect( updateApproval ).toHaveBeenCalledWith(
			'toolu_abc',
			expect.objectContaining( { status: 'sending' } )
		);
	} );

	it( 'leaves the card answerable when the turn ends without the call’s result', async () => {
		const { decide, getApproval } = renderSubmission();

		await decide( 'allow' );

		expect( getApproval().status ).toBe( 'pending' );
	} );

	it( 'sends one answer for a double click', async () => {
		let finishSend: () => void = () => {};
		const submitContextMessage = mockSubmit(
			() =>
				new Promise< void >( ( resolve ) => {
					finishSend = resolve;
				} )
		);
		const { hook } = renderSubmission( { submitContextMessage } );
		const [ card ] = hook.result.current
			.withActionApprovalCards( [] )
			.flatMap( ( message ) => message.content );

		await act( async () => {
			const first = card.componentProps.onDecide( 'allow' );
			const second = card.componentProps.onDecide( 'allow' );
			finishSend();
			await Promise.all( [ first, second ] );
		} );

		expect( submitContextMessage ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not send for a card that is already answered', async () => {
		const { decide, submitContextMessage } = renderSubmission( {
			approval: { ...PENDING, status: 'done' },
		} );

		await decide( 'allow' );

		expect( submitContextMessage ).not.toHaveBeenCalled();
	} );

	it( 'sets the card from the stored state when it was already decided, instead of an error', async () => {
		const submitContextMessage = mockSubmit( async () => {
			throw Object.assign( new Error( 'Streaming error: decided' ), {
				data: { code: 'approval_already_decided', state: 'declined' },
			} );
		} );
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const { decide, getApproval, hook } = renderSubmission( { submitContextMessage } );

		await decide( 'allow' );

		expect( getApproval().status ).toBe( 'declined' );
		expect( hook.result.current.isErrorOnCard ).toBe( true );
	} );

	it( 'keeps the card answerable after a transient error', async () => {
		const submitContextMessage = mockSubmit( async () => {
			throw Object.assign( new Error( 'Streaming error: busy' ), {
				data: { code: 'approval_claim_lost' },
			} );
		} );
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const { decide, getApproval } = renderSubmission( { submitContextMessage } );

		await decide( 'allow' );

		expect( getApproval().status ).toBe( 'error' );
	} );

	it( 'leaves an answered card alone when the rest of its turn fails', async () => {
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		let recordResult = () => {};
		const submitContextMessage = mockSubmit( async ( _message, _options, onDispatch ) => {
			onDispatch?.();
			recordResult();
			throw new Error( 'Stream ended without final result' );
		} );
		const { getApproval, hook, updateApproval } = renderSubmission( {
			submitContextMessage,
		} );
		recordResult = () => {
			updateApproval( 'toolu_abc', { status: 'done' } );
			hook.rerender();
		};

		const [ card ] = hook.result.current
			.withActionApprovalCards( [] )
			.flatMap( ( message ) => message.content );

		// Outside `act`, so the result renders before the send fails, as it does in a real stream.
		await card.componentProps.onDecide( 'allow' );

		expect( getApproval().status ).toBe( 'done' );
		expect( hook.result.current.isErrorOnCard ).toBe( false );
	} );
} );
