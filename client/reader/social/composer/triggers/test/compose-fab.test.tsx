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
import { testComposerConfig } from '../../test-config';
import { ComposeFab } from '../compose-fab';

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
			<ComposerProvider connectionId={ 7 } config={ testComposerConfig }>
				<ComposeFab />
				<Spy onMode={ onMode } />
			</ComposerProvider>
		);

		await user.click( screen.getByRole( 'button', { name: 'Compose' } ) );

		expect( onMode ).toHaveBeenCalledWith(
			expect.objectContaining( {
				kind: 'standalone',
				entry_point: 'fab',
				connectionId: 7,
			} )
		);
	} );

	it( 'is removed from the accessibility tree while a mode is active', async () => {
		let openFn: ( ( m: ComposerMode ) => void ) | null = null;
		function Trigger() {
			const { openComposer } = useComposer();
			openFn = openComposer;
			return null;
		}

		render(
			<ComposerProvider connectionId={ 7 } config={ testComposerConfig }>
				<ComposeFab />
				<Trigger />
			</ComposerProvider>
		);

		expect( screen.getByRole( 'button', { name: 'Compose' } ) ).toBeVisible();

		await act( async () => {
			openFn?.( { kind: 'standalone', entry_point: 'fab' } );
		} );

		// aria-hidden removes from the accessibility tree (see ComposeFab docs).
		expect( screen.queryByRole( 'button', { name: 'Compose' } ) ).toBeNull();
	} );
} );
