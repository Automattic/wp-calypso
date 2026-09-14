/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { SocialAvatar } from '../avatar';

describe( 'SocialAvatar', () => {
	it( 'renders an <img> with the src + alt when both are set', () => {
		render(
			<SocialAvatar
				src="https://example.test/avatar.jpg"
				alt="Alice's avatar"
				className="my-class"
			/>
		);
		const img = screen.getByAltText( "Alice's avatar" ) as HTMLImageElement;
		expect( img ).toBeVisible();
		expect( img ).toHaveAttribute( 'src', 'https://example.test/avatar.jpg' );
		expect( img ).toHaveClass( 'my-class' );
	} );

	it( 'forwards arbitrary <img> props (width / height / loading / aria-hidden)', () => {
		const { container } = render(
			<SocialAvatar
				src="https://example.test/avatar.jpg"
				width={ 32 }
				height={ 32 }
				loading="lazy"
				aria-hidden="true"
			/>
		);
		// `aria-hidden="true"` removes the img from the a11y tree, so
		// `getByRole` can't find it; query the DOM directly.
		const img = container.querySelector( 'img' );
		expect( img ).not.toBeNull();
		expect( img ).toHaveAttribute( 'width', '32' );
		expect( img ).toHaveAttribute( 'height', '32' );
		expect( img ).toHaveAttribute( 'loading', 'lazy' );
		expect( img ).toHaveAttribute( 'aria-hidden', 'true' );
	} );

	it( 'renders the fallback when src is null', () => {
		render(
			<SocialAvatar src={ null } fallback={ <span data-testid="placeholder">placeholder</span> } />
		);
		expect( screen.getByTestId( 'placeholder' ) ).toBeVisible();
		expect( screen.queryByRole( 'img' ) ).toBeNull();
		expect( screen.queryByRole( 'presentation' ) ).toBeNull();
	} );

	it( 'renders the fallback when src is undefined', () => {
		render(
			<SocialAvatar
				src={ undefined }
				fallback={ <span data-testid="placeholder">placeholder</span> }
			/>
		);
		expect( screen.getByTestId( 'placeholder' ) ).toBeVisible();
	} );

	it( 'renders the fallback when src is an empty string', () => {
		// Some upstream APIs return `""` rather than `null` for "no avatar".
		// Both should land on the fallback so the broken-image icon never
		// reaches the DOM.
		render(
			<SocialAvatar src="" fallback={ <span data-testid="placeholder">placeholder</span> } />
		);
		expect( screen.getByTestId( 'placeholder' ) ).toBeVisible();
	} );

	it( 'renders nothing when src is null and no fallback is provided', () => {
		// Banner pattern in SocialProfileCard: when the banner URL is null
		// the band collapses to no element. Default fallback is `null`.
		const { container } = render( <SocialAvatar src={ null } alt="" /> );
		expect( container.firstChild ).toBeNull();
	} );

	it( 'swaps to the fallback after the <img> fires onError', () => {
		// Real-world trigger: stale CDN URL, instance migration, network
		// failure during load. Without this swap the browser leaves a
		// broken-image icon in the avatar slot — the whole reason this
		// component exists.
		render(
			<SocialAvatar
				src="https://example.test/dead.jpg"
				alt=""
				fallback={ <span data-testid="placeholder">placeholder</span> }
			/>
		);
		const img = screen.getByRole( 'presentation' );
		fireEvent.error( img );
		expect( screen.queryByRole( 'presentation' ) ).toBeNull();
		expect( screen.getByTestId( 'placeholder' ) ).toBeVisible();
	} );

	it( 'resets the errored state when src changes (new URL gets a fresh chance)', () => {
		// Use case: account-row inside an infinite feed re-renders with a
		// different actor's avatar, or compose-pill after a connection
		// switch. The previous URL's error must not poison the new one.
		const { rerender } = render(
			<SocialAvatar
				src="https://example.test/dead.jpg"
				alt=""
				fallback={ <span data-testid="placeholder">placeholder</span> }
			/>
		);
		fireEvent.error( screen.getByRole( 'presentation' ) );
		expect( screen.getByTestId( 'placeholder' ) ).toBeVisible();

		rerender(
			<SocialAvatar
				src="https://example.test/live.jpg"
				alt=""
				fallback={ <span data-testid="placeholder">placeholder</span> }
			/>
		);
		// Fallback is gone, fresh <img> is back.
		expect( screen.queryByTestId( 'placeholder' ) ).toBeNull();
		const img = screen.getByRole( 'presentation' ) as HTMLImageElement;
		expect( img ).toHaveAttribute( 'src', 'https://example.test/live.jpg' );
	} );
} );
