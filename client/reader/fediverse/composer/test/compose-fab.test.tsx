/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComposeFab } from '../compose-fab';
import { ComposerProvider, useComposer } from '../composer-provider';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );

jest.mock( '@wordpress/components', () => {
	const React = require( 'react' );
	return {
		Button: ( {
			children,
			onClick,
			className,
			text,
			'aria-hidden': ariaHidden,
			tabIndex,
		}: {
			children?: React.ReactNode;
			onClick?: () => void;
			className?: string;
			text?: string;
			icon?: unknown;
			'aria-hidden'?: boolean;
			tabIndex?: number;
		} ) =>
			React.createElement(
				'button',
				{ onClick, className, 'aria-hidden': ariaHidden, tabIndex },
				text ?? children
			),
	};
} );

jest.mock( '@wordpress/icons', () => ( { edit: null } ) );

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function Harness( { connectionId = 42 }: { connectionId?: number } ) {
	return (
		<ComposerProvider connectionId={ connectionId }>
			<ComposeFab />
		</ComposerProvider>
	);
}

/**
 * Helper: also mounts a trigger consumer so we can open the composer via a
 * separate button (simulating external openComposer calls), letting the FAB
 * reach its hidden state.
 */
function HarnessWithOpener( { connectionId = 42 }: { connectionId?: number } ) {
	return (
		<ComposerProvider connectionId={ connectionId }>
			<OpenerButton />
			<ComposeFab />
		</ComposerProvider>
	);
}

function OpenerButton() {
	const { openComposer } = useComposer();
	return (
		<button onClick={ () => openComposer( { connectionId: 0, entry_point: 'timeline_inline' } ) }>
			open
		</button>
	);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe( '<ComposeFab>', () => {
	it( 'renders a "Compose" button', () => {
		render( <Harness /> );
		expect( screen.getByRole( 'button', { name: 'Compose' } ) ).toBeVisible();
	} );

	it( 'clicking the FAB opens the composer with entry_point "fab"', async () => {
		const user = userEvent.setup();

		function Probe() {
			const { mode } = useComposer();
			return (
				<span data-testid="mode">
					{ mode ? `${ mode.entry_point }:${ mode.connectionId }` : 'none' }
				</span>
			);
		}

		render(
			<ComposerProvider connectionId={ 7 }>
				<Probe />
				<ComposeFab />
			</ComposerProvider>
		);

		await user.click( screen.getByRole( 'button', { name: 'Compose' } ) );
		expect( screen.getByTestId( 'mode' ) ).toHaveTextContent( 'fab:7' );
	} );

	it( 'is visible when mode is null', () => {
		render( <Harness /> );
		const btn = screen.getByRole( 'button', { name: 'Compose' } );
		expect( btn ).not.toHaveClass( 'is-hidden' );
		expect( btn ).not.toHaveAttribute( 'aria-hidden' );
	} );

	it( 'becomes hidden (is-hidden class, aria-hidden, tabIndex=-1) when mode is non-null', async () => {
		const user = userEvent.setup();
		render( <HarnessWithOpener connectionId={ 42 } /> );

		// Open the composer via the external opener.
		await user.click( screen.getByRole( 'button', { name: 'open' } ) );

		// The FAB is still in the DOM but visually and semantically hidden.
		// Use querySelector because aria-hidden removes the element from the
		// accessibility tree, making getByRole unreliable across RTL versions.
		const fab = document.querySelector( '.fediverse-compose-fab' ) as HTMLElement;
		expect( fab ).not.toBeNull();
		expect( fab ).toHaveClass( 'is-hidden' );
		expect( fab ).toHaveAttribute( 'aria-hidden' );
		expect( fab ).toHaveAttribute( 'tabIndex', '-1' );
	} );
} );
