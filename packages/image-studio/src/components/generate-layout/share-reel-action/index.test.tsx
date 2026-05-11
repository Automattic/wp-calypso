import { render, screen, fireEvent } from '@testing-library/react';
import { ShareReelAction } from './index';

const mockUseReelShare = jest.fn();
const mockUseGenericShare = jest.fn();

jest.mock( '../../../hooks/use-reel-share', () => ( {
	useReelShare: () => mockUseReelShare(),
} ) );

jest.mock( '../../../hooks/use-generic-share', () => ( {
	useGenericShare: () => mockUseGenericShare(),
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

jest.mock( '../../confirmation-dialog', () => ( {
	ConfirmationDialog: ( {
		isOpen,
		title,
		actions,
		children,
	}: {
		isOpen: boolean;
		title?: string;
		actions: Array< { text: string; onClick: () => void } >;
		children: React.ReactNode;
	} ) => {
		if ( ! isOpen ) {
			return null;
		}
		return (
			<div role="dialog" aria-label={ title }>
				<p>{ children }</p>
				{ actions.map( ( a ) => (
					<button key={ a.text } onClick={ a.onClick }>
						{ a.text }
					</button>
				) ) }
			</div>
		);
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

	describe( 'confirmation dialog', () => {
		it( 'is hidden when isConfirming is false', () => {
			render( <ShareReelAction /> );
			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		} );

		it( 'is shown when isConfirming is true', () => {
			mockUseReelShare.mockReturnValue( {
				...visibleReel,
				isConfirming: true,
				igDisplayName: 'myhandle',
			} );
			render( <ShareReelAction /> );
			expect( screen.getByRole( 'dialog', { name: /Share to Instagram/i } ) ).toBeInTheDocument();
		} );

		it( 'shows the connected account handle in the body when present, wrapped in <strong>', () => {
			mockUseReelShare.mockReturnValue( {
				...visibleReel,
				isConfirming: true,
				igDisplayName: 'myhandle',
			} );
			render( <ShareReelAction /> );

			const dialog = screen.getByRole( 'dialog' );
			expect( dialog ).toHaveTextContent( /published to myhandle on Instagram/i );

			const handle = screen.getByText( 'myhandle' );
			expect( handle.tagName ).toBe( 'STRONG' );
		} );

		it( 'shows a generic fallback body when no handle is available', () => {
			mockUseReelShare.mockReturnValue( {
				...visibleReel,
				isConfirming: true,
				igDisplayName: null,
			} );
			render( <ShareReelAction /> );
			expect(
				screen.getByText( /published to your connected Instagram account/i )
			).toBeInTheDocument();
		} );

		it( 'invokes confirmShare when Share is clicked', () => {
			const confirmShare = jest.fn();
			mockUseReelShare.mockReturnValue( {
				...visibleReel,
				isConfirming: true,
				igDisplayName: 'myhandle',
				confirmShare,
			} );
			render( <ShareReelAction /> );
			fireEvent.click( screen.getByRole( 'button', { name: 'Share' } ) );
			expect( confirmShare ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'invokes cancelShare when Cancel is clicked', () => {
			const cancelShare = jest.fn();
			mockUseReelShare.mockReturnValue( {
				...visibleReel,
				isConfirming: true,
				igDisplayName: 'myhandle',
				cancelShare,
			} );
			render( <ShareReelAction /> );
			fireEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );
			expect( cancelShare ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
