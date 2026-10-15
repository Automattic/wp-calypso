/**
 * @jest-environment jsdom
 */

/**
 * Page translators (Google Translate, Edge, extensions) rewrite the DOM behind
 * React's back: they wrap translated text in `<font>` elements, which reparents
 * the nodes React thinks it owns. React then calls `removeChild`/`insertBefore`
 * on a parent that no longer holds the node and the page crashes.
 * A known React issue: react/react#11538
 *
 * These tests fake that rewrite, then resolve the loading state, to prove the
 * blurred span is updated in place rather than swapped for another element.
 * If you change how blurring works and one of these goes red, the fix is to
 * keep a single element mounted and change only its text and attributes — not
 * to relax the assertion.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import OverviewCard from '../../overview-card';
import { Stat } from '../../stat';
import { TextBlur } from '../index';

jest.mock( '../../../app/analytics', () => ( {
	useAnalytics: () => ( { recordTracksEvent: () => {} } ),
} ) );

function reparentLikeATranslator( node: Element ) {
	const font = document.createElement( 'font' );
	node.replaceWith( font );
	font.appendChild( node );
}

function Harness( {
	render: renderContent,
}: {
	render: ( isLoading: boolean ) => React.ReactNode;
} ) {
	const [ isLoading, setIsLoading ] = useState( true );
	return (
		<>
			<button onClick={ () => setIsLoading( false ) }>resolve</button>
			{ renderContent( isLoading ) }
		</>
	);
}

function resolve() {
	return userEvent.click( screen.getByRole( 'button', { name: 'resolve' } ) );
}

describe( 'TextBlur survives page translation', () => {
	it( 'updates text in place when the blurred span was reparented', async () => {
		render(
			<Harness
				render={ ( isLoading ) => (
					<div>
						<TextBlur isBlurred={ isLoading } length={ 6 }>
							$1,234
						</TextBlur>
					</div>
				) }
			/>
		);

		reparentLikeATranslator( screen.getByText( 'XXXXXX' ) );
		await resolve();

		expect( screen.getByText( '$1,234' ) ).toBeVisible();
	} );

	it( 'survives translation inside OverviewCard', async () => {
		render(
			<Harness
				render={ ( isLoading ) => (
					<OverviewCard
						title="Plan"
						heading="Business"
						description="Renews next year"
						isLoading={ isLoading }
					/>
				) }
			/>
		);

		reparentLikeATranslator( screen.getByText( 'XXXXXXXXXX' ) );
		reparentLikeATranslator( screen.getByText( 'XXXXXXXXXXXXXXXXXXXX' ) );
		await resolve();

		expect( screen.getByText( 'Business' ) ).toBeVisible();
		expect( screen.getByText( 'Renews next year' ) ).toBeVisible();
	} );

	it( 'survives translation inside Stat', async () => {
		render( <Harness render={ ( isLoading ) => <Stat metric="99%" isLoading={ isLoading } /> } /> );

		reparentLikeATranslator( screen.getByText( 'XXXXX' ) );
		await resolve();

		expect( screen.getByText( '99%' ) ).toBeVisible();
	} );
} );
