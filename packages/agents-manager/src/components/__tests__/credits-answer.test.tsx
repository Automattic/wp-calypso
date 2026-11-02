/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { creditSnapshot } from '../../utils/__tests__/fixtures/credit-snapshot';
import { buildLiveCreditsStatus } from '../../utils/live-credits';
import { CreditsAnswer } from '../credits-answer';

jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );

const status = buildLiveCreditsStatus(
	creditSnapshot( {
		credits_limit: 15000,
		credits_used: 3000,
		credits_remaining: 12000,
		credits_available: 72000,
		top_up_credits_purchased: 100000,
		top_up_credits_remaining: 60000,
	} )
);
const upgrade = {
	kind: 'upgrade' as const,
	label: 'Upgrade',
	href: 'https://example.com/plans',
	target: '_blank',
	rel: 'noopener noreferrer',
	onClick: jest.fn(),
};
const addCredits = {
	...upgrade,
	kind: 'top_up' as const,
	label: 'Add credits',
	href: 'https://example.com/checkout',
};
const answer = {
	status,
	resetDate: 'Oct 17',
	actions: [],
	createdAt: 0,
};

describe( 'CreditsAnswer', () => {
	it( 'tabulates the plan, the top-ups and the total', () => {
		render( <CreditsAnswer { ...answer } /> );

		const rows = screen.getAllByRole( 'row' ).map( ( row ) => row.textContent );
		expect( rows ).toEqual( [
			'SourceLeftResets',
			'Monthly plan12kOct 17 (UTC)',
			'Top-ups60kDon’t expire',
			'Total72k',
		] );
	} );

	it( 'leaves out the top-ups and the total for a site with none left', () => {
		const usedUp = buildLiveCreditsStatus(
			creditSnapshot( { top_up_credits_purchased: 1000, top_up_credits_remaining: 0 } )
		);
		render( <CreditsAnswer { ...answer } status={ usedUp } /> );

		expect( screen.queryByRole( 'rowheader', { name: 'Top-ups' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'rowheader', { name: 'Total' } ) ).not.toBeInTheDocument();
	} );

	it( 'offers Upgrade and Add credits as links that open a new tab and record the click', () => {
		render( <CreditsAnswer { ...answer } actions={ [ upgrade, addCredits ] } /> );

		expect( screen.getByText( 'Need more?' ) ).toBeVisible();
		expect(
			screen.getByText( 'Upgrading your plan raises your monthly credits. Top-ups don’t expire.' )
		).toBeVisible();
		const link = screen.getByRole( 'link', { name: 'Upgrade' } );
		expect( link ).toHaveAttribute( 'href', upgrade.href );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( screen.getByRole( 'link', { name: 'Add credits' } ) ).toHaveAttribute(
			'href',
			addCredits.href
		);
		act( () => link.click() );
		expect( upgrade.onClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'offers only a credits pack where there is no upgrade', () => {
		render( <CreditsAnswer { ...answer } actions={ [ addCredits ] } /> );

		expect(
			screen.getByText( 'Add a credits pack for more. Top-ups don’t expire.' )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Add credits' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'Upgrade' } ) ).not.toBeInTheDocument();
	} );

	it( 'says who to ask instead of showing a button', () => {
		render( <CreditsAnswer { ...answer } purchaseHint="Ask a site admin to add more." /> );

		expect( screen.getByText( 'Ask a site admin to add more.' ) ).toBeVisible();
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	it( 'shows no purchase card when it isn’t known who may buy', () => {
		render( <CreditsAnswer { ...answer } /> );

		expect( screen.queryByText( 'Need more?' ) ).not.toBeInTheDocument();
	} );

	it( 'announces a new answer to screen readers', () => {
		render( <CreditsAnswer { ...answer } createdAt={ Date.now() } /> );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( /^72k credits left\. Resets Oct 1/ );
	} );

	it( 'stays quiet when an old answer comes back with the chat', () => {
		render( <CreditsAnswer { ...answer } createdAt={ Date.now() - 60000 } /> );

		expect( screen.getByRole( 'status' ) ).toBeEmptyDOMElement();
	} );
} );
