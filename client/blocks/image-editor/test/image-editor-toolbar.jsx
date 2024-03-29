/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageEditorToolbar } from '../image-editor-toolbar';

describe( 'ImageEditorToolbar', () => {
	const defaultProps = {
		onShowNotice: jest.fn(),
		translate: ( string ) => string,
	};

	test( 'should not add `is-disabled` class to aspect ratio toolbar button by default', () => {
		const { container } = render( <ImageEditorToolbar { ...defaultProps } /> );
		expect(
			container
				.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ]
				.classList.contains( 'is-disabled' )
		).toBe( false );
	} );

	test(
		'should add `is-disabled` class to aspect ratio toolbar button ' +
			'when image is smaller than minimum dimensions',
		() => {
			const { container } = render(
				<ImageEditorToolbar { ...defaultProps } isAspectRatioDisabled />
			);
			expect(
				container
					.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ]
					.classList.contains( 'is-disabled' )
			).toBe( true );
		}
	);

	test(
		'should not trigger the method `onShowNotice` ' +
			'when image width and height meet the minimum dimensions',
		async () => {
			const { container } = render(
				<ImageEditorToolbar { ...defaultProps } isAspectRatioDisabled={ false } />
			);

			await userEvent.click(
				container.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ]
			);

			expect( defaultProps.onShowNotice ).not.toHaveBeenCalled();
		}
	);

	test(
		'should trigger the method `onShowNotice` with correct translation string ' +
			'when the user clicks on a disabled aspect ratio toolbar button',
		async () => {
			const { container } = render(
				<ImageEditorToolbar { ...defaultProps } isAspectRatioDisabled />
			);
			await userEvent.click(
				container.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ]
			);

			expect( defaultProps.onShowNotice ).toHaveBeenCalledWith(
				'To change the aspect ratio, the height and width must be bigger than {{strong}}%(width)dpx{{/strong}}.'
			);
		}
	);

	test(
		'should show aspect ratio popover display ' +
			'when image width and height meet the minimum dimensions',
		async () => {
			const { container } = render(
				<ImageEditorToolbar { ...defaultProps } isAspectRatioDisabled={ false } />
			);
			await userEvent.click(
				container.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ]
			);

			expect( screen.queryByRole( 'tooltip' ) ).toBeDefined();
		}
	);

	test(
		'should prevent aspect ratio popover display' +
			'when image width and height do not meet the minimum dimensions',
		async () => {
			const { container } = render(
				<ImageEditorToolbar { ...defaultProps } isAspectRatioDisabled />
			);
			await userEvent.click(
				container.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ]
			);

			expect( screen.queryByRole( 'tooltip' ) ).toBeNull();
		}
	);
} );
