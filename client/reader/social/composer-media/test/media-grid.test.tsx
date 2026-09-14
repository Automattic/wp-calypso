/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaGrid, type MediaGridItem } from '../media-grid';

interface Item {
	localId: string;
	previewUrl: string;
	alt: string;
	state: 'staged' | 'pending' | 'failed';
}

// Mirror of atmosphere's discriminated-union variants, used to verify the
// generic `<MediaGrid>` works against the original consumer's shape.
type AtmoFixture = MediaGridItem & {
	kind: 'compressing' | 'uploading' | 'uploaded' | 'failed';
};

const baseProps = {
	max: 4,
	accept: 'image/jpeg,image/png',
	onPickFiles: jest.fn(),
	onRemove: jest.fn(),
	onRetry: jest.fn(),
	onSetAlt: jest.fn(),
	isPending: ( i: Item ) => i.state === 'pending',
	canEditAlt: ( i: Item ) => i.state === 'staged' || i.state === 'pending',
	isFailed: ( i: Item ) => i.state === 'failed',
	errorMessage: ( i: Item ) => ( i.state === 'failed' ? 'broken' : null ),
};

describe( 'MediaGrid', () => {
	it( 'renders nothing when items is empty', () => {
		const { container } = render( <MediaGrid items={ [] } { ...baseProps } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders a thumbnail for each item with the preview URL and alt text', () => {
		const items: Item[] = [
			{ localId: 'a', previewUrl: 'blob:a', alt: 'Alpha', state: 'staged' },
			{ localId: 'b', previewUrl: 'blob:b', alt: '', state: 'staged' },
		];
		render( <MediaGrid items={ items } { ...baseProps } /> );
		expect( screen.getByRole( 'img', { name: 'Alpha' } ) ).toBeVisible();
		// Empty alt falls back to a default attached-image label
		expect( screen.getByRole( 'img', { name: /attached image/i } ) ).toBeVisible();
	} );

	it( 'renders a spinner when isPending(item) is true', () => {
		const items: Item[] = [ { localId: 'a', previewUrl: 'blob:a', alt: '', state: 'pending' } ];
		const { container } = render( <MediaGrid items={ items } { ...baseProps } /> );
		expect( container.querySelector( '.components-spinner' ) ).toBeInTheDocument();
	} );

	it( 'renders error pane and retry button when isFailed(item) is true', async () => {
		const onRetry = jest.fn();
		const items: Item[] = [ { localId: 'a', previewUrl: 'blob:a', alt: '', state: 'failed' } ];
		const user = userEvent.setup();
		render( <MediaGrid items={ items } { ...baseProps } onRetry={ onRetry } /> );
		expect( screen.getByText( 'broken' ) ).toBeVisible();
		await user.click( screen.getByRole( 'button', { name: /retry/i } ) );
		expect( onRetry ).toHaveBeenCalledWith( 'a' );
	} );

	it( 'fires onRemove when × is clicked', async () => {
		const onRemove = jest.fn();
		const items: Item[] = [ { localId: 'a', previewUrl: 'blob:a', alt: '', state: 'staged' } ];
		const user = userEvent.setup();
		render( <MediaGrid items={ items } { ...baseProps } onRemove={ onRemove } /> );
		await user.click( screen.getByRole( 'button', { name: /remove image/i } ) );
		expect( onRemove ).toHaveBeenCalledWith( 'a' );
	} );

	it( 'shows the "+" tile when items.length < max', () => {
		const items: Item[] = [ { localId: 'a', previewUrl: 'blob:a', alt: '', state: 'staged' } ];
		render( <MediaGrid items={ items } { ...baseProps } max={ 4 } /> );
		expect( screen.getByRole( 'button', { name: /add more images/i } ) ).toBeVisible();
	} );

	it( 'hides the "+" tile when items.length === max', () => {
		const items: Item[] = Array.from( { length: 4 }, ( _, i ) => ( {
			localId: `i${ i }`,
			previewUrl: 'blob:x',
			alt: '',
			state: 'staged' as const,
		} ) );
		render( <MediaGrid items={ items } { ...baseProps } max={ 4 } /> );
		expect( screen.queryByRole( 'button', { name: /add more images/i } ) ).toBeNull();
	} );

	it( 'fires onPickFiles with the picked files and resets the input', async () => {
		const onPickFiles = jest.fn();
		const items: Item[] = [ { localId: 'a', previewUrl: 'blob:a', alt: '', state: 'staged' } ];
		render( <MediaGrid items={ items } { ...baseProps } onPickFiles={ onPickFiles } /> );
		const input = screen
			.getByRole( 'group' )
			.querySelector( 'input[type="file"]' ) as HTMLInputElement;
		const f = new File( [ 'x' ], 'x.jpg', { type: 'image/jpeg' } );
		Object.defineProperty( input, 'files', { value: [ f ], configurable: true } );
		input.dispatchEvent( new Event( 'change', { bubbles: true } ) );
		expect( onPickFiles ).toHaveBeenCalledWith( [ f ] );
		expect( input.value ).toBe( '' );
	} );

	it( 'works with an atmosphere-shaped discriminated-union fixture', () => {
		const items: AtmoFixture[] = [
			{ kind: 'compressing', localId: 'c', previewUrl: '', alt: '' },
			{ kind: 'uploading', localId: 'u', previewUrl: 'blob:u', alt: '' },
			{ kind: 'uploaded', localId: 'd', previewUrl: 'blob:d', alt: 'done' },
			{ kind: 'failed', localId: 'f', previewUrl: 'blob:f', alt: '' },
		];
		const { container } = render(
			<MediaGrid
				items={ items }
				max={ 4 }
				accept="image/jpeg"
				onPickFiles={ jest.fn() }
				onRemove={ jest.fn() }
				onRetry={ jest.fn() }
				onSetAlt={ jest.fn() }
				isPending={ ( i ) => i.kind === 'compressing' || i.kind === 'uploading' }
				canEditAlt={ ( i ) => i.kind === 'uploading' || i.kind === 'uploaded' }
				isFailed={ ( i ) => i.kind === 'failed' }
				errorMessage={ ( i ) => ( i.kind === 'failed' ? 'oops' : null ) }
			/>
		);
		// Compressing item has empty previewUrl, no <img>. The other three render.
		expect( screen.getAllByRole( 'img' ) ).toHaveLength( 3 );
		// One spinner each for compressing + uploading.
		expect( container.querySelectorAll( '.components-spinner' ) ).toHaveLength( 2 );
		// Retry only on the failed item.
		expect( screen.getByRole( 'button', { name: /retry/i } ) ).toBeVisible();
		// Alt buttons gated to uploading + uploaded (compressing no, failed no).
		expect( screen.queryAllByRole( 'button', { name: /alt text/i } ) ).toHaveLength( 2 );
	} );

	it( 'gates alt-text popover on canEditAlt(item)', () => {
		const items: Item[] = [
			{ localId: 'a', previewUrl: 'blob:a', alt: '', state: 'failed' },
			{ localId: 'b', previewUrl: 'blob:b', alt: '', state: 'staged' },
		];
		render( <MediaGrid items={ items } { ...baseProps } /> );
		// Failed item has canEditAlt=false in the fixture above, staged has canEditAlt=true
		const altButtons = screen.queryAllByRole( 'button', { name: /alt text/i } );
		expect( altButtons ).toHaveLength( 1 );
	} );
} );
