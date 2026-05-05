/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComposerFooter } from '../composer-footer';
import { useComposer } from '../composer-provider';
import type { ComposerImage } from '../media/types';

jest.mock( '../composer-provider', () => ( {
	useComposer: jest.fn(),
} ) );

const mockUseComposer = useComposer as jest.MockedFunction< typeof useComposer >;

function makeUploadedImage( id: string ): ComposerImage {
	return {
		kind: 'uploaded',
		localId: id,
		previewUrl: `blob:${ id }`,
		alt: '',
		aspectRatio: { width: 100, height: 100 },
		blob: { ref: { $link: id }, mimeType: 'image/jpeg', size: 100 } as never,
	};
}

const noop = () => {};

function setComposerState( overrides: Partial< ReturnType< typeof useComposer > > = {} ) {
	mockUseComposer.mockReturnValue( {
		mode: null,
		openComposer: jest.fn(),
		closeComposer: jest.fn(),
		images: [],
		addFiles: jest.fn(),
		removeImage: jest.fn(),
		clearAll: jest.fn(),
		retryImage: jest.fn(),
		setAlt: jest.fn(),
		isAllUploaded: true,
		isAnyPending: false,
		...overrides,
	} as ReturnType< typeof useComposer > );
}

describe( '<ComposerFooter>', () => {
	beforeEach( () => {
		setComposerState();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'shows the remaining count', () => {
		render(
			<ComposerFooter graphemeCount={ 100 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByText( '200' ) ).toBeVisible();
	} );

	it( 'disables Post when count is 0', () => {
		render(
			<ComposerFooter graphemeCount={ 0 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByRole( 'button', { name: /post/i } ) ).toBeDisabled();
	} );

	it( 'disables Post when count is over the limit', () => {
		render(
			<ComposerFooter graphemeCount={ 301 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByRole( 'button', { name: /post/i } ) ).toBeDisabled();
	} );

	it( 'shows amber count under 50 remaining', () => {
		render(
			<ComposerFooter graphemeCount={ 260 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByText( '40' ) ).toHaveClass( 'is-warn' );
	} );

	it( 'shows red count at zero / negative', () => {
		render(
			<ComposerFooter graphemeCount={ 305 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByText( '-5' ) ).toHaveClass( 'is-over' );
	} );

	it( 'media button is enabled and labeled "Add media" with no images', () => {
		render(
			<ComposerFooter graphemeCount={ 5 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		const media = screen.getByRole( 'button', { name: 'Add media' } );
		expect( media ).not.toHaveAttribute( 'aria-disabled' );
		expect( media ).not.toBeDisabled();
	} );

	it( 'media button is aria-disabled and reads "Maximum 4 images" at 4 images', () => {
		setComposerState( {
			images: [
				makeUploadedImage( 'a' ),
				makeUploadedImage( 'b' ),
				makeUploadedImage( 'c' ),
				makeUploadedImage( 'd' ),
			],
		} );
		render(
			<ComposerFooter graphemeCount={ 5 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		const media = screen.getByRole( 'button', { name: 'Maximum 4 images' } );
		expect( media ).toHaveAttribute( 'aria-disabled', 'true' );
		// We use aria-disabled (not the native HTML `disabled` attribute) so
		// screen-reader users can still focus the button and hear the label.
		expect( media ).not.toBeDisabled();
	} );

	it( 'shows spinner state when pending', () => {
		const { container } = render(
			<ComposerFooter graphemeCount={ 5 } onSubmit={ noop } isPending limit={ 300 } />
		);
		expect( screen.getByRole( 'button', { name: /post/i } ) ).toBeDisabled();
		// `<Spinner>` from `@wordpress/components` renders an SVG with class
		// `components-spinner` (and `role="presentation"`), so we query by class.
		expect( container.querySelector( '.components-spinner' ) ).toBeVisible();
	} );

	it( 'fires onSubmit when Post is clicked', async () => {
		const onSubmit = jest.fn();
		const user = userEvent.setup();
		render(
			<ComposerFooter
				graphemeCount={ 10 }
				onSubmit={ onSubmit }
				isPending={ false }
				limit={ 300 }
			/>
		);
		await user.click( screen.getByRole( 'button', { name: /post/i } ) );
		expect( onSubmit ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'count is aria-live="off" outside the warn threshold', () => {
		render(
			<ComposerFooter graphemeCount={ 249 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		// remaining = 51, which is above WARN_THRESHOLD_REMAINING (50).
		expect( screen.getByText( '51' ) ).toHaveAttribute( 'aria-live', 'off' );
	} );

	it( 'count is aria-live="polite" once the warn threshold is reached', () => {
		render(
			<ComposerFooter graphemeCount={ 250 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		// remaining = 50, which equals WARN_THRESHOLD_REMAINING (boundary).
		expect( screen.getByText( '50' ) ).toHaveAttribute( 'aria-live', 'polite' );
	} );

	it( 'count is aria-live="polite" when over the limit', () => {
		render(
			<ComposerFooter graphemeCount={ 305 } onSubmit={ noop } isPending={ false } limit={ 300 } />
		);
		expect( screen.getByText( '-5' ) ).toHaveAttribute( 'aria-live', 'polite' );
	} );
} );
