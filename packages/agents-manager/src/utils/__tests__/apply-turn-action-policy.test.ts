import { applyTurnActionPolicy } from '../apply-turn-action-policy';
import type { AgentTurnPosition } from '../message-turns';
import type { MessageAction } from '@automattic/agenttic-ui/dist/types';

const noop = () => {};

const actions: MessageAction[] = [
	{ id: 'checkpoint', label: 'Undo', onClick: noop, order: 1 },
	{ id: 'feedback-up', label: 'Good response', onClick: noop, order: 2 },
	{ id: 'feedback-down', label: 'Bad response', onClick: noop, order: 3 },
	{ id: 'regenerate', label: 'Regenerate', onClick: noop, order: 3.5 },
	{ type: 'component', id: 'copy', component: () => null, order: 4 },
	{ type: 'component', id: 'sources', component: () => null },
	{ id: 'host-custom', label: 'Host action', onClick: noop },
];

const summarize = ( result: MessageAction[] ) =>
	result.map( ( action ) => [ action.id, action.revealOnHover ] );

const position = ( overrides: Partial< AgentTurnPosition > = {} ): AgentTurnPosition => ( {
	isLatestTurn: true,
	isLastInTurn: true,
	carriesTurnActions: true,
	...overrides,
} );

describe( 'applyTurnActionPolicy', () => {
	it( 'leaves messages outside an agent turn alone', () => {
		expect( applyTurnActionPolicy( actions, undefined, true ) ).toBe( actions );
	} );

	it( 'keeps only ungoverned actions on the message still streaming', () => {
		const result = applyTurnActionPolicy( actions, position(), true );

		expect( summarize( result ) ).toEqual( [
			[ 'checkpoint', undefined ],
			[ 'sources', undefined ],
			[ 'host-custom', undefined ],
		] );
	} );

	it( 'keeps per-message actions on settled messages of the streaming turn', () => {
		const result = applyTurnActionPolicy(
			actions,
			position( { isLastInTurn: false, carriesTurnActions: false } ),
			true
		);

		expect( summarize( result ) ).toEqual( [
			[ 'checkpoint', undefined ],
			[ 'copy', undefined ],
			[ 'sources', undefined ],
			[ 'host-custom', undefined ],
		] );
	} );

	it( 'shows everything on the carrier of the settled latest turn', () => {
		const result = applyTurnActionPolicy( actions, position(), false );

		expect( summarize( result ) ).toEqual( [
			[ 'checkpoint', undefined ],
			[ 'feedback-up', undefined ],
			[ 'feedback-down', undefined ],
			[ 'regenerate', undefined ],
			[ 'copy', undefined ],
			[ 'sources', undefined ],
			[ 'host-custom', undefined ],
		] );
	} );

	it( 'keeps turn actions off messages that do not carry them', () => {
		const result = applyTurnActionPolicy(
			actions,
			position( { isLastInTurn: true, carriesTurnActions: false } ),
			false
		);

		expect( summarize( result ) ).toEqual( [
			[ 'checkpoint', undefined ],
			[ 'copy', undefined ],
			[ 'sources', undefined ],
			[ 'host-custom', undefined ],
		] );
	} );

	it( 'reveals response actions of an earlier turn only on hover and drops regenerate', () => {
		const result = applyTurnActionPolicy( actions, position( { isLatestTurn: false } ), true );

		expect( summarize( result ) ).toEqual( [
			[ 'checkpoint', undefined ],
			[ 'feedback-up', true ],
			[ 'feedback-down', true ],
			[ 'copy', true ],
			[ 'sources', undefined ],
			[ 'host-custom', undefined ],
		] );
	} );

	it( 'keeps a pressed thumb wherever it is, even while its turn streams on', () => {
		const pressed: MessageAction[] = [
			{ id: 'feedback-up', label: 'Good response', onClick: noop, pressed: true },
			{ id: 'feedback-down', label: 'Bad response', onClick: noop, disabled: true },
		];

		const result = applyTurnActionPolicy(
			pressed,
			position( { isLastInTurn: false, carriesTurnActions: false } ),
			true
		);

		expect( summarize( result ) ).toEqual( [ [ 'feedback-up', undefined ] ] );
	} );

	it( 'does not mutate the given actions', () => {
		applyTurnActionPolicy( actions, position( { isLatestTurn: false } ), false );

		expect( actions.every( ( action ) => action.revealOnHover === undefined ) ).toBe( true );
	} );
} );
