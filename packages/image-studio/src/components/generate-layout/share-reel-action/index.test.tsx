import { fireEvent, render, screen } from '@testing-library/react';
import { ShareReelAction } from './index';

const mockUseReelShare = jest.fn();
const mockUseGenericShare = jest.fn();
const mockDialogProps = jest.fn();

jest.mock( '../../../hooks/use-reel-share', () => ( {
	useReelShare: ( ...args: unknown[] ) => mockUseReelShare( ...args ),
} ) );

jest.mock( '../../../hooks/use-generic-share', () => ( {
	useGenericShare: ( ...args: unknown[] ) => mockUseGenericShare( ...args ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '@wordpress/icons', () => ( {
	share: 'share-icon',
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( props: Record< string, unknown > ) => {
		const { icon, label, variant, isBusy, showTooltip, ...rest } = props;
		// Strip wp-Button-only props so the rest spread to <button> is clean.
		void variant;
		void isBusy;
		void showTooltip;
		return (
			<button aria-label={ typeof label === 'string' ? label : undefined } { ...rest }>
				{ icon as React.ReactNode }
			</button>
		);
	},
} ) );

jest.mock( '../../reel-share-confirmation-dialog', () => ( {
	ReelShareConfirmationDialog: ( props: Record< string, unknown > ) => {
		mockDialogProps( props );
		return props.isOpen ? <div role="dialog" /> : null;
	},
} ) );

jest.mock( 'social-logos', () => ( {
	SocialLogo: ( { icon, size }: { icon: string; size: number } ) => (
		<span data-testid="social-logo" data-icon={ icon } data-size={ size } />
	),
} ) );

const visibleReel = {
	isVisible: true,
	isSharing: false,
	isConfirming: false,
	igDisplayName: null as string | null,
	requestShare: jest.fn(),
	confirmShare: jest.fn(),
	cancelShare: jest.fn(),
};

const visibleGeneric = {
	isVisible: true,
	isSharing: false,
	handleShare: jest.fn(),
};

describe( '<ShareReelAction />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseReelShare.mockReturnValue( { ...visibleReel } );
		mockUseGenericShare.mockReturnValue( { ...visibleGeneric } );
	} );

	it( 'renders nothing when both share modes are hidden', () => {
		mockUseReelShare.mockReturnValue( { ...visibleReel, isVisible: false } );
		mockUseGenericShare.mockReturnValue( { ...visibleGeneric, isVisible: false } );

		const { container } = render( <ShareReelAction /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders both buttons when both modes are visible', () => {
		render( <ShareReelAction /> );
		expect( screen.getByRole( 'button', { name: /Share on Instagram/i } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Share to other apps/i } ) ).toBeInTheDocument();
	} );

	it( 'labels both share hooks with the modal surface', () => {
		render( <ShareReelAction /> );
		expect( mockUseReelShare ).toHaveBeenCalledWith( 'modal' );
		expect( mockUseGenericShare ).toHaveBeenCalledWith( 'modal' );
	} );

	it( 'renders only the IG button when generic share is hidden', () => {
		mockUseGenericShare.mockReturnValue( { ...visibleGeneric, isVisible: false } );

		render( <ShareReelAction /> );
		expect( screen.getByRole( 'button', { name: /Share on Instagram/i } ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: /Share to other apps/i } )
		).not.toBeInTheDocument();
	} );

	it( 'renders only the generic button when IG share is hidden', () => {
		mockUseReelShare.mockReturnValue( { ...visibleReel, isVisible: false } );

		render( <ShareReelAction /> );
		expect(
			screen.queryByRole( 'button', { name: /Share on Instagram/i } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Share to other apps/i } ) ).toBeInTheDocument();
	} );

	it( 'disables the IG button while a Reel share is in flight', () => {
		mockUseReelShare.mockReturnValue( { ...visibleReel, isSharing: true } );

		render( <ShareReelAction /> );
		expect( screen.getByRole( 'button', { name: /Sharing on Instagram/i } ) ).toBeDisabled();
	} );

	it( 'disables the generic button while a generic share is in flight', () => {
		mockUseGenericShare.mockReturnValue( { ...visibleGeneric, isSharing: true } );

		render( <ShareReelAction /> );
		expect( screen.getByRole( 'button', { name: /Sharing to other apps/i } ) ).toBeDisabled();
	} );

	it( 'invokes requestShare on IG click (does not dispatch yet)', () => {
		const requestShare = jest.fn();
		const confirmShare = jest.fn();
		mockUseReelShare.mockReturnValue( { ...visibleReel, requestShare, confirmShare } );

		render( <ShareReelAction /> );
		fireEvent.click( screen.getByRole( 'button', { name: /Share on Instagram/i } ) );
		expect( requestShare ).toHaveBeenCalledTimes( 1 );
		expect( confirmShare ).not.toHaveBeenCalled();
	} );

	it( 'invokes generic handleShare on share-icon click', () => {
		const handleShare = jest.fn();
		mockUseGenericShare.mockReturnValue( { ...visibleGeneric, handleShare } );

		render( <ShareReelAction /> );
		fireEvent.click( screen.getByRole( 'button', { name: /Share to other apps/i } ) );
		expect( handleShare ).toHaveBeenCalledTimes( 1 );
	} );

	describe( 'confirmation dialog wiring', () => {
		it( 'passes through reel state and handlers as props', () => {
			const confirmShare = jest.fn();
			const cancelShare = jest.fn();
			mockUseReelShare.mockReturnValue( {
				...visibleReel,
				isConfirming: true,
				igDisplayName: 'myhandle',
				confirmShare,
				cancelShare,
			} );

			render( <ShareReelAction /> );

			expect( mockDialogProps ).toHaveBeenCalledWith(
				expect.objectContaining( {
					isOpen: true,
					igDisplayName: 'myhandle',
					onConfirm: confirmShare,
					onCancel: cancelShare,
				} )
			);
			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
		} );

		it( 'passes isOpen=false when reel.isConfirming is false', () => {
			mockUseReelShare.mockReturnValue( { ...visibleReel, isConfirming: false } );

			render( <ShareReelAction /> );

			expect( mockDialogProps ).toHaveBeenCalledWith(
				expect.objectContaining( { isOpen: false } )
			);
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );
	} );
} );
