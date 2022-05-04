/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { useSandbox } from 'calypso/test-helpers/use-sinon';
import { ImageEditorToolbar } from '../image-editor-toolbar';

describe( 'ImageEditorToolbar', () => {
	let defaultProps;

	useSandbox( ( sandbox ) => {
		defaultProps = {
			onShowNotice: sandbox.spy(),
			translate: ( string ) => string,
		};
	} );

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
		() => {
			const { container } = render(
				<ImageEditorToolbar { ...defaultProps } isAspectRatioDisabled={ false } />
			);

			fireEvent.click( container.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ] );

			expect( defaultProps.onShowNotice.called ).toBe( false );
		}
	);

	test(
		'should trigger the method `onShowNotice` with correct translation string ' +
			'when the user clicks on a disabled aspect ratio toolbar button',
		() => {
			const { container } = render(
				<ImageEditorToolbar { ...defaultProps } isAspectRatioDisabled />
			);
			fireEvent.click( container.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ] );

			expect(
				defaultProps.onShowNotice.calledWith(
					'To change the aspect ratio, the height and width must be bigger than {{strong}}%(width)dpx{{/strong}}.'
				)
			).toBe( true );
		}
	);

	test(
		'should show aspect ratio popover display ' +
			'when image width and height meet the minimum dimensions',
		() => {
			const { container } = render(
				<ImageEditorToolbar { ...defaultProps } isAspectRatioDisabled={ false } />
			);
			fireEvent.click( container.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ] );

			expect( screen.queryByRole( 'tooltip' ) ).toBeDefined();
		}
	);

	test(
		'should prevent aspect ratio popover display' +
			'when image width and height do not meet the minimum dimensions',
		() => {
			const { container } = render(
				<ImageEditorToolbar { ...defaultProps } isAspectRatioDisabled />
			);
			fireEvent.click( container.getElementsByClassName( 'image-editor__toolbar-button' )[ 1 ] );

			expect( screen.queryByRole( 'tooltip' ) ).toBeNull();
		}
	);
} );
