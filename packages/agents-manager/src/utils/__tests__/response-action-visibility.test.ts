import { applyResponseActionVisibility } from '../response-action-visibility';
import type { MessageAction } from '@automattic/agenttic-ui/dist/types';

const noop = () => {};

const actions: MessageAction[] = [
	{ id: 'checkpoint', label: 'Undo', onClick: noop, order: 1 },
	{ id: 'feedback-up', label: 'Good response', onClick: noop, order: 2 },
	{ id: 'feedback-down', label: 'Bad response', onClick: noop, order: 3 },
	{ id: 'regenerate', label: 'Regenerate', onClick: noop, disabled: true, order: 3.5 },
	{ type: 'component', id: 'copy', component: () => null, order: 4 },
	{ type: 'component', id: 'sources', component: () => null },
	{ id: 'host-custom', label: 'Host action', onClick: noop },
];

const summarize = ( result: MessageAction[] ) =>
	result.map( ( action ) => [ action.id, action.revealOnHover ] );

describe( 'applyResponseActionVisibility', () => {
	it( 'leaves the settled latest turn untouched', () => {
		expect(
			applyResponseActionVisibility( actions, { isLatestTurn: true, isStreaming: false } )
		).toBe( actions );
	} );

	it( 'holds response actions back while the latest turn streams', () => {
		const result = applyResponseActionVisibility( actions, {
			isLatestTurn: true,
			isStreaming: true,
		} );

		expect( summarize( result ) ).toEqual( [
			[ 'checkpoint', undefined ],
			[ 'sources', undefined ],
			[ 'host-custom', undefined ],
		] );
	} );

	it( 'reveals response actions of earlier turns only on hover', () => {
		const result = applyResponseActionVisibility( actions, {
			isLatestTurn: false,
			isStreaming: true,
		} );

		expect( summarize( result ) ).toEqual( [
			[ 'checkpoint', undefined ],
			[ 'feedback-up', true ],
			[ 'feedback-down', true ],
			[ 'regenerate', true ],
			[ 'copy', true ],
			[ 'sources', undefined ],
			[ 'host-custom', undefined ],
		] );
	} );

	it( 'keeps a pressed thumb on screen while its turn streams on', () => {
		const voted: MessageAction[] = [
			{ id: 'feedback-up', label: 'Good response', onClick: noop, pressed: true },
			{ id: 'feedback-down', label: 'Bad response', onClick: noop, disabled: true },
		];

		const result = applyResponseActionVisibility( voted, {
			isLatestTurn: true,
			isStreaming: true,
		} );

		expect( summarize( result ) ).toEqual( [ [ 'feedback-up', undefined ] ] );
	} );

	it( 'marks a pressed thumb on an earlier turn hover-only like its row', () => {
		const voted: MessageAction[] = [
			{ id: 'feedback-up', label: 'Good response', onClick: noop, pressed: true },
			{ id: 'feedback-down', label: 'Bad response', onClick: noop, disabled: true },
		];

		const result = applyResponseActionVisibility( voted, {
			isLatestTurn: false,
			isStreaming: false,
		} );

		expect( summarize( result ) ).toEqual( [
			[ 'feedback-up', true ],
			[ 'feedback-down', true ],
		] );
	} );

	it( 'does not mutate the given actions', () => {
		applyResponseActionVisibility( actions, { isLatestTurn: false, isStreaming: false } );

		expect( actions.every( ( action ) => action.revealOnHover === undefined ) ).toBe( true );
	} );
} );
