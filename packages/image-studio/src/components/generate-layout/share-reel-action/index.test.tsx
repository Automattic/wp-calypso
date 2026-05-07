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

jest.mock( 'social-logos', () => ( {
	SocialLogo: ( { icon, size }: { icon: string; size: number } ) => (
		<span data-testid="social-logo" data-icon={ icon } data-size={ size } />
	),
} ) );

const visibleReel = {
	canShare: true,
	reason: null,
	isVisible: true,
	isSharing: false,
	handleShare: jest.fn(),
};

const visibleGeneric = {
	isVisible: true,
	handleShare: jest.fn(),
};

describe( '<ShareReelAction />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseReelShare.mockReturnValue( visibleReel );
		mockUseGenericShare.mockReturnValue( visibleGeneric );
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

	it( 'invokes handleShare on IG click', () => {
		const handleShare = jest.fn();
		mockUseReelShare.mockReturnValue( { ...visibleReel, handleShare } );

		render( <ShareReelAction /> );
		fireEvent.click( screen.getByRole( 'button', { name: /Share on Instagram/i } ) );
		expect( handleShare ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'invokes generic handleShare on share-icon click', () => {
		const handleShare = jest.fn();
		mockUseGenericShare.mockReturnValue( { ...visibleGeneric, handleShare } );

		render( <ShareReelAction /> );
		fireEvent.click( screen.getByRole( 'button', { name: /Share to other apps/i } ) );
		expect( handleShare ).toHaveBeenCalledTimes( 1 );
	} );
} );
