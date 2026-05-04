/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	ComposerProvider,
	useComposer,
	type ActiveMode,
	type ComposerMode,
} from '../../composer-provider';

// Note: this test file does NOT render `<ComposeFab>` directly. Task 6 wires
// the FAB into `<ComposerProvider>` itself, so any consumer of the provider
// implicitly gets the FAB. Rendering it explicitly here would mount a
// duplicate after Task 6 lands and break `getByRole` (which throws on
// multiple matches). The red phase still produces a valid failure: the FAB
// is absent until Task 6 wires it through, so `getByRole( ..., { name: 'Compose post' } )`
// throws "Unable to find element".

function Spy( { onMode }: { onMode: ( m: ActiveMode ) => void } ) {
	const { mode } = useComposer();
	if ( mode ) {
		onMode( mode );
	}
	return null;
}

describe( '<ComposeFab>', () => {
	it( 'opens the composer in standalone mode with entry_point=fab', async () => {
		const user = userEvent.setup();
		const onMode = jest.fn();
		render(
			<ComposerProvider connectionId={ 7 }>
				<Spy onMode={ onMode } />
			</ComposerProvider>
		);

		await user.click( screen.getByRole( 'button', { name: 'Compose post' } ) );

		expect( onMode ).toHaveBeenCalledWith(
			expect.objectContaining( {
				kind: 'standalone',
				entry_point: 'fab',
				connectionId: 7,
			} )
		);
	} );

	it( 'is hidden while a mode is active', async () => {
		let openFn: ( ( m: ComposerMode ) => void ) | null = null;
		function Trigger() {
			const { openComposer } = useComposer();
			openFn = openComposer;
			return null;
		}

		render(
			<ComposerProvider connectionId={ 7 }>
				<Trigger />
			</ComposerProvider>
		);

		expect( screen.getByRole( 'button', { name: 'Compose post' } ) ).toBeVisible();

		await act( async () => {
			openFn?.( { kind: 'standalone', entry_point: 'fab' } );
		} );

		expect( screen.queryByRole( 'button', { name: 'Compose post' } ) ).toBeNull();
	} );
} );
