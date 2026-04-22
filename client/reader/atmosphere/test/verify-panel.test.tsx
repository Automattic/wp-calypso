/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { VerifyPanel } from '../verify-panel';

describe( 'VerifyPanel', () => {
	it( 'renders nothing when not active', () => {
		const { container } = render(
			<VerifyPanel data={ null } error={ null } isLoading={ false } />
		);
		expect( container.firstChild ).toBeNull();
	} );

	it( 'renders profile on success', () => {
		render(
			<VerifyPanel
				data={ {
					did: 'did:plc:a',
					handle: 'alice',
					display_name: 'Alice',
					description: 'hello',
					avatar: null,
					banner: null,
					counts: { followers: 10, follows: 5, posts: 42 },
					raw: {},
				} }
				error={ null }
				isLoading={ false }
			/>
		);
		expect( screen.getByRole( 'heading', { name: 'Alice' } ) ).toBeVisible();
		expect( screen.getByText( '@alice' ) ).toBeVisible();
		expect( screen.getByText( '42' ) ).toBeVisible();
	} );

	it( 'renders auth_failed message', () => {
		render( <VerifyPanel data={ null } error={ { kind: 'auth_failed' } } isLoading={ false } /> );
		expect( screen.getByText( /re-authorized/i ) ).toBeVisible();
	} );
} );
