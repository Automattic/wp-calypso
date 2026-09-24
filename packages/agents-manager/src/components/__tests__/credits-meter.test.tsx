/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from '@wordpress/element';

// agenttic-ui ships ESM only, which jest can't resolve here; the ring is a stub.
jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		ProgressRing: ( { percent, tone }: { percent: number; tone: string } ) => (
			<svg data-testid="ring" data-percent={ percent } data-tone={ tone } />
		),
	} ),
	{ virtual: true }
);
jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );

import CreditsMeter from '../credits-meter';
import type { CreditsStatus } from '../../utils/credits';

const paid: CreditsStatus = {
	plan: 'paid',
	percent: 72,
	pools: [
		{
			id: 'plan',
			label: 'Monthly plan',
			percent: 72,
			dateLabel: 'Resets 17 Oct',
			remaining: 10800,
			total: 15000,
		},
		{ id: 'topups', label: 'Top-ups', percent: 80, remaining: 800, total: 1000 },
	],
};

const freeOut: CreditsStatus = {
	plan: 'free',
	percent: 0,
	pools: [ { id: 'free', label: 'Free credits', percent: 0 } ],
};

describe( 'CreditsMeter', () => {
	it( 'uses a primary Upgrade CTA on paid plans while preserving the current editor', () => {
		render(
			<CreditsMeter
				status={ paid }
				isOpen
				onToggle={ () => {} }
				upgradeUrl="https://wordpress.com/plans/example.wordpress.com"
			/>
		);
		const action = screen.getByRole( 'link', { name: 'Upgrade' } );
		expect( action ).toHaveAttribute( 'href', 'https://wordpress.com/plans/example.wordpress.com' );
		expect( action ).toHaveAttribute( 'target', '_blank' );
		expect( action ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		expect( action ).toHaveClass( 'is-primary' );
		expect( screen.queryByRole( 'button', { name: 'Add credits' } ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Resets 17 Oct' ) ).toBeInTheDocument();
	} );

	it.each( [ 'click', 'Enter', 'Space' ] )(
		'focuses the popover on %s, keeps Upgrade keyboard accessible, and restores focus on Escape',
		async ( input ) => {
			const user = userEvent.setup();
			function Meter() {
				const [ isOpen, setIsOpen ] = useState( false );
				return (
					<CreditsMeter
						status={ paid }
						isOpen={ isOpen }
						onToggle={ setIsOpen }
						upgradeUrl="https://wordpress.com/plans/example.wordpress.com"
					/>
				);
			}
			render( <Meter /> );
			const toggle = screen.getByRole( 'button', { name: '72% of site credits left' } );
			if ( input === 'click' ) {
				await user.click( toggle );
			} else {
				await user.tab();
				await user.keyboard( input === 'Enter' ? '{Enter}' : ' ' );
			}
			const dialog = screen.getByRole( 'dialog', { name: 'Site credits' } );
			await waitFor( () => expect( dialog ).toHaveFocus() );
			const action = screen.getByRole( 'link', { name: 'Upgrade' } );
			expect( action ).not.toHaveFocus();
			await user.tab();
			expect( action ).toHaveFocus();
			await user.keyboard( '{Escape}' );
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
			await waitFor( () => expect( toggle ).toHaveFocus() );
		}
	);

	it( 'labels the ring with the balance sentence and toggles the popover', () => {
		const onToggle = jest.fn();
		render( <CreditsMeter status={ paid } isOpen={ false } onToggle={ onToggle } /> );
		const toggle = screen.getByRole( 'button', { name: '72% of site credits left' } );
		expect( screen.getByTestId( 'ring' ) ).toHaveAttribute( 'data-tone', 'muted' );
		fireEvent.click( toggle );
		expect( onToggle ).toHaveBeenCalledWith( true );
	} );

	it( 'lists each pool with its figures and a secondary CTA on paid plans', () => {
		const onAction = jest.fn();
		render( <CreditsMeter status={ paid } isOpen onToggle={ () => {} } onAction={ onAction } /> );
		expect( screen.getByText( 'Site credits' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Monthly plan' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Resets 17 Oct' ) ).toBeInTheDocument();
		expect( screen.getByText( '10,800 of 15,000 credits' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Top-ups' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Manage' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add credits' } ) ).toHaveClass( 'is-secondary' );
		fireEvent.click( screen.getByRole( 'button', { name: 'Add credits' } ) );
		expect( onAction ).toHaveBeenCalled();
	} );

	it( 'renders real fractional allowance details without inventing purchase or manage actions', () => {
		const status: CreditsStatus = {
			plan: 'paid',
			percent: 0.04,
			remaining: 1,
			pools: [
				{
					id: 'plan',
					label: 'Monthly plan',
					percent: 0.04,
					remaining: 1,
					total: 2500,
					dateLabel: 'Resets Oct 1 (UTC)',
				},
			],
		};
		render( <CreditsMeter status={ status } isOpen onToggle={ () => {} } /> );
		expect(
			screen.getByRole( 'button', { name: '<1% of site credits left' } )
		).toBeInTheDocument();
		expect( screen.getByText( '<1%' ) ).toBeInTheDocument();
		expect( screen.getByText( '1 of 2,500 credits' ) ).toBeInTheDocument();
		expect(
			screen.getByRole( 'group', { name: 'Monthly plan, <1% left, Resets Oct 1 (UTC)' } )
		).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Add credits' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Manage' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Top-ups' ) ).not.toBeInTheDocument();
	} );

	it( 'labels a spendable fraction as under one percent, not exhausted', () => {
		const freeFraction: CreditsStatus = {
			plan: 'free',
			percent: 0.4,
			pools: [ { id: 'free', label: 'Free credits', percent: 0.4 } ],
		};
		render( <CreditsMeter status={ freeFraction } isOpen onToggle={ () => {} } /> );
		expect(
			screen.getByRole( 'button', { name: '<1% of free credits left' } )
		).toBeInTheDocument();
		expect( screen.getByText( '<1%' ) ).toBeInTheDocument();
		expect( screen.queryByText( /used all your free credits/ ) ).not.toBeInTheDocument();
	} );

	it( 'shows the out-of-credits message and Upgrade on an exhausted free plan', () => {
		render(
			<CreditsMeter
				status={ freeOut }
				isOpen
				onToggle={ () => {} }
				onAction={ () => {} }
				manageUrl="/credits"
			/>
		);
		expect( screen.getByText( '0% left' ) ).toBeInTheDocument();
		expect( screen.getByText( /used all your free credits/ ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Upgrade' } ) ).toHaveClass( 'is-primary' );
		expect( screen.getByRole( 'link', { name: 'Manage' } ) ).toHaveAttribute( 'href', '/credits' );
	} );
} );
