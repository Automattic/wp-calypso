import { render, screen, fireEvent } from '@testing-library/react';
import { ShareReelAction } from './index';

const mockUseReelShare = jest.fn();

jest.mock( '../../../hooks/use-reel-share', () => ( {
	useReelShare: () => mockUseReelShare(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		variant,
		isBusy,
		__next40pxDefaultSize,
		icon,
		label,
		showTooltip,
		...props
	}: any ) => (
		<button aria-label={ label } { ...props }>
			{ icon }
			{ children }
		</button>
	),
} ) );

jest.mock( 'social-logos', () => ( {
	SocialLogo: ( { icon, size }: { icon: string; size: number } ) => (
		<span data-testid="social-logo" data-icon={ icon } data-size={ size } />
	),
} ) );

describe( '<ShareReelAction />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders nothing when isVisible is false', () => {
		mockUseReelShare.mockReturnValue( {
			canShare: false,
			reason: 'no-video',
			isVisible: false,
			isSharing: false,
			handleShare: jest.fn(),
		} );

		const { container } = render( <ShareReelAction /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the button when isVisible is true', () => {
		mockUseReelShare.mockReturnValue( {
			canShare: true,
			reason: null,
			isVisible: true,
			isSharing: false,
			handleShare: jest.fn(),
		} );

		render( <ShareReelAction /> );
		expect(
			screen.getByRole( 'button', { name: /Share as Instagram Reel/i } )
		).toBeInTheDocument();
	} );

	it( 'disables the button while a share is in flight', () => {
		mockUseReelShare.mockReturnValue( {
			canShare: true,
			reason: null,
			isVisible: true,
			isSharing: true,
			handleShare: jest.fn(),
		} );

		render( <ShareReelAction /> );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
	} );

	it( 'invokes handleShare on click', () => {
		const handleShare = jest.fn();
		mockUseReelShare.mockReturnValue( {
			canShare: true,
			reason: null,
			isVisible: true,
			isSharing: false,
			handleShare,
		} );

		render( <ShareReelAction /> );
		fireEvent.click( screen.getByRole( 'button', { name: /Share as Instagram Reel/i } ) );
		expect( handleShare ).toHaveBeenCalledTimes( 1 );
	} );
} );
