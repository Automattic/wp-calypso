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
	label: 'Uninstall plugin',
	arguments: { slug: 'hello-dolly' },
	origin: 'execute',
	messageId: 'approval-message',
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
	const cancelAwaitingApprovals = jest.fn();
	const hook = renderHook(
		( { isProcessing } ) =>
			useActionApprovalSubmission( {
				approvals: new Map( [ [ current.toolCallId, current ] ] ),
				updateApproval,
				cancelAwaitingApprovals,
				submitContextMessage,
				isProcessing,
				streamGeneration,
			} ),
		{ initialProps: { isProcessing: false } }
	);

	const decide = async ( decision: 'allow' | 'decline' ) => {
		const [ card ] = hook.result.current
			.withActionApprovalCards( [] )
			.flatMap( ( message ) => message.content );
		await act( async () => {
			await card.componentProps.onDecide( decision );
		} );
	};

	return {
		hook,
		decide,
		submitContextMessage,
		updateApproval,
		cancelAwaitingApprovals,
		getApproval: () => current,
	};
}

describe( 'useActionApprovalSubmission', () => {
	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it.each( [ 'allow', 'decline' ] as const )(
		'sends %s as one approvalDecision data part, with no text',
		async ( decision ) => {
			const { decide, submitContextMessage } = renderSubmission();

			await decide( decision );

			expect( submitContextMessage ).toHaveBeenCalledWith(
				'',
				{ type: 'data', data: { approvalDecision: { proposalId: 123, decision } } },
				expect.any( Function )
			);
		}
	);

	it( 'shows the card in place of the message that asked for the approval', () => {
		const { hook } = renderSubmission();
		const messages = [
			{ id: 'preamble', timestamp: 10 },
			{ id: 'approval-message', timestamp: 30 },
		] as Parameters< typeof hook.result.current.withActionApprovalCards >[ 0 ];

		expect(
			hook.result.current.withActionApprovalCards( messages ).map( ( message ) => message.id )
		).toEqual( [ 'preamble', 'action-approval-toolu_abc' ] );
	} );

	it( 'cancels a waiting card when another turn starts', () => {
		const { hook, cancelAwaitingApprovals } = renderSubmission();

		hook.rerender( { isProcessing: true } );

		expect( cancelAwaitingApprovals ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'doesn’t cancel the card its own answer starts a turn for', async () => {
		let finishSend: () => void = () => {};
		const submitContextMessage = mockSubmit(
			( _message, _options, onDispatch ) =>
				new Promise< void >( ( resolve ) => {
					onDispatch?.();
					finishSend = resolve;
				} )
		);
		const { hook, cancelAwaitingApprovals } = renderSubmission( { submitContextMessage } );
		const [ card ] = hook.result.current
			.withActionApprovalCards( [] )
			.flatMap( ( message ) => message.content );

		let answer: Promise< void > | undefined;
		await act( async () => {
			answer = card.componentProps.onDecide( 'allow' );
		} );
		hook.rerender( { isProcessing: true } );
		await act( async () => {
			finishSend();
			await answer;
		} );

		expect( cancelAwaitingApprovals ).not.toHaveBeenCalled();
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

	it.each( [
		'invalid_approval_decision',
		'approval_not_found',
		'approval_site_mismatch',
		'approval_extension_required',
		'approval_claim_lost',
	] )( 'stops offering an answer after %s', async ( code ) => {
		const submitContextMessage = mockSubmit( async () => {
			throw Object.assign( new Error( 'Streaming error: approval' ), { data: { code } } );
		} );
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		const { decide, getApproval } = renderSubmission( { submitContextMessage } );

		await decide( 'allow' );

		expect( getApproval().status ).toBe( 'unavailable' );
	} );

	it( 'keeps the card answerable after a connection failure', async () => {
		const submitContextMessage = mockSubmit( async () => {
			throw new Error( 'Failed to fetch' );
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
