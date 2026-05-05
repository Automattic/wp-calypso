/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageGrid } from '../image-grid';
import type { ComposerImage } from '../types';

const uploaded = ( id: string, alt = '' ): ComposerImage => ( {
	kind: 'uploaded',
	localId: id,
	previewUrl: `blob:${ id }`,
	alt,
	aspectRatio: { width: 100, height: 100 },
	blob: { $type: 'blob', ref: { $link: 'a'.repeat( 50 ) }, mimeType: 'image/jpeg', size: 100 },
} );

describe( 'ImageGrid', () => {
	const noop = () => {};

	it( 'renders one thumbnail per image and a + tile when below max', () => {
		render(
			<ImageGrid
				images={ [ uploaded( 'a' ), uploaded( 'b' ) ] }
				max={ 4 }
				onPickFiles={ noop }
				onRemove={ noop }
				onRetry={ noop }
				onSetAlt={ noop }
			/>
		);

		expect( screen.getAllByRole( 'img' ) ).toHaveLength( 2 );
		expect( screen.getByRole( 'button', { name: /add more images/i } ) ).toBeVisible();
	} );

	it( 'hides the + tile at the max', () => {
		render(
			<ImageGrid
				images={ [ uploaded( 'a' ), uploaded( 'b' ), uploaded( 'c' ), uploaded( 'd' ) ] }
				max={ 4 }
				onPickFiles={ noop }
				onRemove={ noop }
				onRetry={ noop }
				onSetAlt={ noop }
			/>
		);

		expect( screen.queryByRole( 'button', { name: /add more images/i } ) ).toBeNull();
	} );

	it( 'calls onRemove with the localId when × is clicked', async () => {
		const user = userEvent.setup();
		const onRemove = jest.fn();
		render(
			<ImageGrid
				images={ [ uploaded( 'a' ) ] }
				max={ 4 }
				onPickFiles={ noop }
				onRemove={ onRemove }
				onRetry={ noop }
				onSetAlt={ noop }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: /remove image/i } ) );

		expect( onRemove ).toHaveBeenCalledWith( 'a' );
	} );

	it( 'shows a Retry control for failed entries', async () => {
		const user = userEvent.setup();
		const onRetry = jest.fn();
		const failed: ComposerImage = {
			kind: 'failed',
			localId: 'f',
			previewUrl: 'blob:f',
			alt: '',
			aspectRatio: { width: 100, height: 100 },
			sourceFile: new File( [ 'x' ], 'f.png', { type: 'image/png' } ),
			error: { kind: 'blob_decode_failed' },
		};
		render(
			<ImageGrid
				images={ [ failed ] }
				max={ 4 }
				onPickFiles={ noop }
				onRemove={ noop }
				onRetry={ onRetry }
				onSetAlt={ noop }
			/>
		);

		await user.click( screen.getByRole( 'button', { name: /retry/i } ) );

		expect( onRetry ).toHaveBeenCalledWith( 'f' );
	} );
} );
