/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { fireEvent, render, screen } from '@testing-library/react';

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
jest.mock( '@wordpress/components', () => ( {
	// Mirrors wp's Button: an anchor when `href` is set, a button otherwise.
	Button: ( {
		children,
		className,
		href,
		icon,
		label,
		onClick,
		'aria-expanded': ariaExpanded,
	}: {
		children?: React.ReactNode;
		className?: string;
		href?: string;
		icon?: React.ReactNode;
		label?: string;
		onClick?: () => void;
		'aria-expanded'?: boolean;
	} ) =>
		href ? (
			<a className={ className } href={ href }>
				{ children }
			</a>
		) : (
			<button
				className={ className }
				aria-label={ label }
				aria-expanded={ ariaExpanded }
				onClick={ onClick }
			>
				{ icon }
				{ children }
			</button>
		),
	Dropdown: ( {
		open,
		onToggle,
		renderToggle,
		renderContent,
	}: {
		open: boolean;
		onToggle: ( willOpen: boolean ) => void;
		renderToggle: ( props: { isOpen: boolean; onToggle: () => void } ) => React.ReactNode;
		renderContent: () => React.ReactNode;
	} ) => (
		<div>
			{ renderToggle( { isOpen: open, onToggle: () => onToggle( ! open ) } ) }
			{ open && <div role="dialog">{ renderContent() }</div> }
		</div>
	),
} ) );
jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: ( format: string, ...args: unknown[] ) => {
		let index = 0;
		return format
			.replace( /%(\d+\$)?[sd]/g, () => String( args[ index++ ] ) )
			.replace( /%%/g, '%' );
	},
} ) );

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
			screen.getByRole( 'button', { name: 'Less than 1% of site credits left' } )
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
		expect( screen.getByRole( 'button', { name: 'Upgrade' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: 'Manage' } ) ).toHaveAttribute( 'href', '/credits' );
	} );
} );
