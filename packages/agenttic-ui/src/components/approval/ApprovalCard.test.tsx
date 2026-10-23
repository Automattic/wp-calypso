// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ApprovalCard } from './ApprovalCard';
import type { ApprovalCardProps, ApprovalCardState, ApprovalDecision } from './ApprovalCard';

afterEach( cleanup );

const props: ApprovalCardProps = {
	proposalId: 'proposal-1',
	description: 'Uninstall plugin',
	notice: 'Plugin data may be removed.',
	site: 'Example site',
	target: 'Example plugin',
	allowForChat: true,
	state: 'pending',
	onDecision: () => {},
};

describe( 'ApprovalCard', () => {
	it.each< [ ApprovalCardState, number, boolean ] >( [
		[ 'pending', 3, false ],
		[ 'sending', 3, true ],
		[ 'done', 0, false ],
		[ 'declined', 0, false ],
		[ 'failed', 0, false ],
		[ 'cancelled', 0, false ],
		[ 'outcome_unknown', 0, false ],
	] )( 'exposes only the permitted controls in %s', ( state, count, disabled ) => {
		render( <ApprovalCard { ...props } state={ state } /> );
		expect( screen.getAllByRole( 'region' ) ).toHaveLength( 1 );
		expect( screen.getAllByRole( 'status' ) ).toHaveLength( 1 );
		const buttons = screen.queryAllByRole< HTMLButtonElement >( 'button' );
		expect( buttons ).toHaveLength( count );
		buttons.forEach( ( button ) => expect( button.disabled ).toBe( disabled ) );
	} );

	it.each< [ string, ApprovalDecision ] >( [
		[ 'Allow', 'allow_once' ],
		[ 'Allow for this chat', 'allow_for_chat' ],
		[ 'Decline', 'decline' ],
	] )( 'sends %s once and locks every decision before the host updates', ( name, decision ) => {
		const decisions: ApprovalDecision[] = [];
		const onDecision = ( value: ApprovalDecision ) => decisions.push( value );
		const { rerender } = render( <ApprovalCard { ...props } onDecision={ onDecision } /> );
		const button = screen.getByRole( 'button', { name } );
		button.focus();
		act( () => {
			button.click();
			button.click();
		} );
		expect( decisions ).toEqual( [ decision ] );
		expect( document.activeElement ).toBe( screen.getByRole( 'region' ) );
		screen.getAllByRole< HTMLButtonElement >( 'button' ).forEach( ( control ) => {
			expect( control.disabled ).toBe( true );
			fireEvent.click( control );
		} );
		rerender( <ApprovalCard { ...props } state="sending" onDecision={ onDecision } /> );
		screen.getAllByRole( 'button' ).forEach( ( control ) => fireEvent.click( control ) );
		expect( decisions ).toEqual( [ decision ] );
		rerender( <ApprovalCard { ...props } state="pending" onDecision={ onDecision } /> );
		screen.getAllByRole< HTMLButtonElement >( 'button' ).forEach( ( control ) => {
			expect( control.disabled ).toBe( false );
		} );
		act( () => {
			button.click();
			button.click();
		} );
		expect( decisions ).toEqual( [ decision, decision ] );
		screen.getAllByRole< HTMLButtonElement >( 'button' ).forEach( ( control ) => {
			expect( control.disabled ).toBe( true );
			fireEvent.click( control );
		} );
		expect( decisions ).toEqual( [ decision, decision ] );
		rerender( <ApprovalCard { ...props } state="done" onDecision={ onDecision } /> );
		expect( screen.queryAllByRole( 'button' ) ).toHaveLength( 0 );
		expect( document.activeElement ).toBe( screen.getByRole( 'region' ) );
	} );

	it( 'offers only one-time approval and decline for always-ask actions', () => {
		render( <ApprovalCard { ...props } allowForChat={ false } /> );
		expect( screen.queryByRole( 'button', { name: 'Allow for this chat' } ) ).toBeNull();
		expect( screen.getAllByRole( 'button' ) ).toHaveLength( 2 );
		expect( screen.getByRole< HTMLButtonElement >( 'button', { name: 'Allow' } ).disabled ).toBe(
			false
		);
		expect( screen.getByRole< HTMLButtonElement >( 'button', { name: 'Decline' } ).disabled ).toBe(
			false
		);
	} );

	it( 'does not carry a submitted decision into another proposal', () => {
		const { rerender } = render( <ApprovalCard { ...props } /> );
		fireEvent.click( screen.getByRole( 'button', { name: 'Allow' } ) );
		rerender( <ApprovalCard { ...props } proposalId="proposal-2" /> );
		expect( screen.getAllByRole( 'region' ) ).toHaveLength( 1 );
		screen.getAllByRole< HTMLButtonElement >( 'button' ).forEach( ( button ) => {
			expect( button.disabled ).toBe( false );
		} );
	} );
} );
