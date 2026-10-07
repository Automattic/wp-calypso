/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from '@wordpress/element';

// agenttic-ui ships ESM only, which jest can't resolve here; the dot is a stub.
jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		StatusIndicator: ( { tone, size }: { tone: string; size?: number } ) => (
			<svg data-testid="dot" data-tone={ tone } data-size={ size } />
		),
	} ),
	{ virtual: true }
);
jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );

import CreditsMeter from '../credits-meter';
import { creditSnapshot } from '../../utils/__tests__/fixtures/credit-snapshot';
import { localNumber } from '../../utils/__tests__/fixtures/local-number';
import { buildMockCreditsStatus } from '../../utils/credits';
import { buildLiveCreditsStatus, parseCreditSnapshot } from '../../utils/live-credits';
import type { CreditsStatus } from '../../utils/credits';
import type { CreditSnapshot } from '../../utils/live-credits';

const paid: CreditsStatus = {
	plan: 'paid',
	percent: 72,
	remaining: 11600,
	pools: [
		{
			id: 'plan',
			label: 'Monthly plan',
			percent: 72,
			dateLabel: 'Resets 17 Oct',
			remaining: 10800,
			total: 15000,
		},
		{ id: 'topups', label: 'Top-ups', remaining: 800 },
	],
};

const freeOut: CreditsStatus = {
	plan: 'free',
	percent: 0,
	pools: [ { id: 'free', label: 'Free credits', percent: 0 } ],
};

// Shaped like buildLiveCreditsStatus output for an 80,000-credit plan.
const livePaid = ( remaining: number ): CreditsStatus => {
	const percent = ( 100 * remaining ) / 80000;
	return {
		plan: 'paid',
		planTier: 'business',
		percent,
		remaining,
		pools: [
			{
				id: 'plan',
				label: 'Monthly plan',
				percent,
				remaining,
				total: 80000,
				dateLabel: 'Resets Oct 8 (UTC)',
			},
		],
	};
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
			const toggle = screen.getByRole( 'button', {
				name: `${ localNumber( 11.6 ) }k credits left`,
			} );
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

	it( 'labels the dot with the balance sentence and toggles the popover', () => {
		const onToggle = jest.fn();
		render( <CreditsMeter status={ paid } isOpen={ false } onToggle={ onToggle } /> );
		const toggle = screen.getByRole( 'button', { name: `${ localNumber( 11.6 ) }k credits left` } );
		expect( screen.getByTestId( 'dot' ) ).toHaveAttribute( 'data-tone', 'error' );
		expect( screen.getByTestId( 'dot' ) ).toHaveAttribute( 'data-size', '12' );
		fireEvent.click( toggle );
		expect( onToggle ).toHaveBeenCalledWith( true );
	} );

	it( 'lists each pool with its figures and a secondary CTA on paid plans', () => {
		const onAction = jest.fn();
		render( <CreditsMeter status={ paid } isOpen onToggle={ () => {} } onAction={ onAction } /> );
		expect( screen.getByText( 'Site credits' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Monthly plan' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Resets 17 Oct' ) ).toBeInTheDocument();
		expect(
			screen.getByText( `${ localNumber( 10.8 ) }k of ${ localNumber( 15 ) }k credits left` )
		).toBeInTheDocument();
		expect( screen.getByText( 'Top-ups' ) ).toBeInTheDocument();
		expect( screen.getByText( `${ localNumber( 800 ) } credits left` ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Manage' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add credits' } ) ).toHaveClass( 'is-secondary' );
		fireEvent.click( screen.getByRole( 'button', { name: 'Add credits' } ) );
		expect( onAction ).toHaveBeenCalled();
	} );

	it( 'turns the dot red below 20k credits whatever the plan share', () => {
		const { rerender } = render(
			<CreditsMeter status={ paid } isOpen={ false } onToggle={ () => {} } />
		);
		const cases: [ CreditsStatus, string, number ][] = [
			[ { ...paid, remaining: 20000 }, 'muted', 20 ],
			[ { ...paid, remaining: 19999 }, 'error', 19.9 ],
			[ { ...paid, percent: 0, remaining: 25000 }, 'muted', 25 ],
		];
		for ( const [ status, tone, thousands ] of cases ) {
			rerender( <CreditsMeter status={ status } isOpen={ false } onToggle={ () => {} } /> );
			expect(
				screen.getByRole( 'button', { name: `${ localNumber( thousands ) }k credits left` } )
			).toBeInTheDocument();
			expect( screen.getByTestId( 'dot' ) ).toHaveAttribute( 'data-tone', tone );
		}
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
			screen.getByRole( 'button', { name: `${ localNumber( 1 ) } credit left` } )
		).toBeInTheDocument();
		expect( screen.getByText( '<1%' ) ).toBeInTheDocument();
		expect(
			screen.getByText( `${ localNumber( 1 ) } of ${ localNumber( 2.5 ) }k credits left` )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'group', { name: 'Monthly plan, <1% left, Resets Oct 1 (UTC)' } )
		).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Add credits' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Manage' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Top-ups' ) ).not.toBeInTheDocument();
	} );

	it( 'replaces the detail with the used-all message on a paid plan at exactly zero', () => {
		render(
			<CreditsMeter
				status={ livePaid( 0 ) }
				isOpen
				onToggle={ () => {} }
				upgradeUrl="https://wordpress.com/plans/example.wordpress.com"
			/>
		);
		expect(
			screen.getByRole( 'button', { name: `${ localNumber( 0 ) } credits left` } )
		).toBeInTheDocument();
		expect( screen.getByTestId( 'dot' ) ).toHaveAttribute( 'data-tone', 'error' );
		expect( screen.getByText( '0% left' ) ).toHaveClass( 'is-exhausted' );
		expect( screen.getByText( 'You’ve used all your site credits.' ) ).toHaveClass(
			'agents-manager-credits-meter__message'
		);
		expect(
			screen.queryByText( `of ${ localNumber( 80 ) }k credits left`, { exact: false } )
		).not.toBeInTheDocument();
		expect( screen.queryByText( /used all your free credits/ ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Monthly plan' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Resets Oct 8 (UTC)' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Upgrade' } ) ).toHaveClass( 'is-primary' );
	} );

	it( 'keeps the detail and neutral percent on a paid plan with one credit left', () => {
		render(
			<CreditsMeter
				status={ livePaid( 1 ) }
				isOpen
				onToggle={ () => {} }
				upgradeUrl="https://wordpress.com/plans/example.wordpress.com"
			/>
		);
		expect( screen.getByText( '<1%' ) ).not.toHaveClass( 'is-exhausted' );
		expect(
			screen.getByText( `${ localNumber( 1 ) } of ${ localNumber( 80 ) }k credits left` )
		).toBeInTheDocument();
		expect( screen.queryByText( /used all your/ ) ).not.toBeInTheDocument();
	} );

	it( 'gives the combined balance in the tooltip when only top-ups are left', () => {
		render(
			<CreditsMeter
				status={ { ...livePaid( 0 ), remaining: 67000 } }
				isOpen
				onToggle={ () => {} }
			/>
		);
		expect(
			screen.getByRole( 'button', { name: `${ localNumber( 67 ) }k credits left` } )
		).toBeInTheDocument();
		expect( screen.getByTestId( 'dot' ) ).toHaveAttribute( 'data-tone', 'muted' );
		expect( screen.getByText( '0%' ) ).not.toHaveClass( 'is-exhausted' );
		expect(
			screen.getByText( `${ localNumber( 0 ) } of ${ localNumber( 80 ) }k credits left` )
		).toBeInTheDocument();
		expect( screen.queryByText( /used all your/ ) ).not.toBeInTheDocument();
	} );

	describe( 'top-ups', () => {
		// A live site with 10,800 of 15,000 plan credits left, through the real parser.
		const liveStatus = ( overrides: Partial< CreditSnapshot > = {} ) =>
			buildLiveCreditsStatus(
				parseCreditSnapshot(
					creditSnapshot( {
						credits_limit: 15000,
						credits_used: 4200,
						credits_remaining: 10800,
						credits_available: 10800,
						...overrides,
					} ),
					123
				)!
			);
		const topUps = {
			credits_available: 77800,
			top_up_credits_purchased: 100000,
			top_up_credits_used: 33000,
			top_up_credits_remaining: 67000,
		};
		const balanceOnly = ( name: string, amount: string ) => {
			const row = screen.getByRole( 'group', { name } );
			expect( row ).toHaveClass( 'is-balance-only' );
			expect( within( row ).getByText( 'Top-ups' ) ).toHaveClass(
				'agents-manager-credits-meter__pool-label'
			);
			expect( within( row ).getByText( amount ) ).toHaveClass(
				'agents-manager-credits-meter__pool-balance'
			);
			expect( within( row ).getByText( amount ) ).not.toHaveClass( 'is-exhausted' );
			expect( within( row ).queryByText( /%/ ) ).not.toBeInTheDocument();
			expect( row.querySelector( '.agents-manager-credits-meter__bar' ) ).toBeNull();
		};

		it( 'shows bought top-ups as their balance under a muted label', () => {
			render( <CreditsMeter status={ liveStatus( topUps ) } isOpen onToggle={ () => {} } /> );
			const amount = `${ localNumber( 67 ) }k credits left`;
			balanceOnly( `Top-ups, ${ amount }`, amount );
			expect(
				screen.getByRole( 'group', { name: 'Monthly plan, 72% left, Resets Oct 1 (UTC)' } )
			).not.toHaveClass( 'is-balance-only' );
			expect( screen.getByText( '72%' ) ).toBeInTheDocument();
			expect(
				screen.getByText( `${ localNumber( 10.8 ) }k of ${ localNumber( 15 ) }k credits left` )
			).toBeInTheDocument();
			expect(
				screen.getByRole( 'button', { name: `${ localNumber( 77.8 ) }k credits left` } )
			).toBeInTheDocument();
		} );

		it( 'shows used-up top-ups at zero without the exhausted style the plan row takes', () => {
			render(
				<CreditsMeter
					status={ liveStatus( {
						credits_used: 15000,
						credits_remaining: 0,
						credits_available: 0,
						exhausted: true,
						top_up_credits_purchased: 100000,
						top_up_credits_used: 100000,
						top_up_credits_remaining: 0,
					} ) }
					isOpen
					onToggle={ () => {} }
				/>
			);
			const amount = `${ localNumber( 0 ) } credits left`;
			balanceOnly( `Top-ups, ${ amount }`, amount );
			expect( screen.getByText( '0% left' ) ).toHaveClass( 'is-exhausted' );
			expect( screen.getByText( /used all your site credits/ ) ).toBeInTheDocument();
		} );

		it.each( [
			[ 'not enrolled in top-ups', {} ],
			[
				'with unreadable purchases',
				{
					top_up_credits_purchased: null,
					top_up_credits_used: 33000,
					top_up_credits_remaining: null,
				},
			],
			[
				'that never bought top-ups',
				{ top_up_credits_purchased: 0, top_up_credits_used: 0, top_up_credits_remaining: 0 },
			],
			[ 'with top-ups that disagree with its balance', { ...topUps, credits_available: 77799 } ],
		] as const )( 'has no top-ups row for a site %s', ( _, overrides ) => {
			render( <CreditsMeter status={ liveStatus( overrides ) } isOpen onToggle={ () => {} } /> );
			expect( screen.queryByText( 'Top-ups' ) ).not.toBeInTheDocument();
			expect( screen.getByText( 'Monthly plan' ) ).toBeInTheDocument();
		} );

		it.each( [
			[ 50, '46', `${ localNumber( 1 ) }k credits left` ],
			[ 0, '0', `${ localNumber( 0 ) } credits left` ],
		] )(
			'gives demo top-ups at %i%% the same balance-only row',
			( percent, planPercent, amount ) => {
				render(
					<CreditsMeter
						status={ buildMockCreditsStatus( 'paid', percent ) }
						isOpen
						onToggle={ () => {} }
						onAction={ () => {} }
					/>
				);
				balanceOnly( `Top-ups, ${ amount }`, amount );
				expect(
					screen.getByRole( 'group', {
						name: `Monthly plan, ${ planPercent }% left, Resets 17 Oct`,
					} )
				).toBeInTheDocument();
			}
		);
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
		expect( screen.getByText( '0% left' ) ).toHaveClass( 'is-exhausted' );
		expect( screen.getByText( 'You’ve used all your free credits.' ) ).toHaveClass(
			'agents-manager-credits-meter__message'
		);
		expect( screen.queryByText( /used all your site credits/ ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Upgrade' } ) ).toHaveClass( 'is-primary' );
		expect( screen.getByRole( 'link', { name: 'Manage' } ) ).toHaveAttribute( 'href', '/credits' );
	} );
} );
