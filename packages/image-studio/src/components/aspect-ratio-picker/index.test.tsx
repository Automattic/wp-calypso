/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock( '@automattic/agenttic-ui', () => ( {
	AgentUI: {
		InputToolbar: ( { label, children }: { label: string; children: React.ReactNode } ) => (
			<div>
				<button type="button">{ label }</button>
				{ children }
			</div>
		),
	},
	cn: ( base: string, flags: Record< string, boolean > ) =>
		[ base, ...Object.keys( flags ).filter( ( key ) => flags[ key ] ) ].join( ' ' ),
} ) );

vi.mock( '@wordpress/data', () => ( {
	useDispatch: vi.fn( () => ( {} ) ),
	useSelect: vi.fn(),
} ) );

vi.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

vi.mock( '../../utils/tracking', () => ( {
	trackImageStudioAspectRatioSelected: vi.fn(),
} ) );

vi.mock( '../../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		JetpackAIFeaturedImage: 'jetpack_ai_featured_image',
		JetpackExternalMediaFeaturedImage: 'jetpack_external_media_featured_image',
	},
} ) );

vi.mock( '../icons/AspectRatioIcon', () => ( {
	AspectRatioIcon: () => null,
} ) );

// Import after mocks
import { useDispatch, useSelect } from '@wordpress/data';
import { type Mock, vi } from 'vitest';
import { ImageStudioMode } from '../../types';
import { THEME_ASPECT_RATIOS } from '../../utils/theme-aspect-ratio';
import { trackImageStudioAspectRatioSelected } from '../../utils/tracking';
import { ASPECT_RATIO_OPTIONS, AspectRatioPicker } from './index';

const SINGLE_TEMPLATE = `<!-- wp:group -->
<div class="wp-block-group"><!-- wp:post-featured-image {"aspectRatio":"4/3"} /--></div>
<!-- /wp:group -->`;

const THREE_TWO_TEMPLATE = '<!-- wp:post-featured-image {"aspectRatio":"3/2"} /-->';

function mockStore(
	selectedAspectRatio: string | null,
	entryPoint: string | null,
	templateContent: string | null = null
) {
	( useSelect as Mock ).mockImplementation( ( selector ) =>
		selector( ( storeName: string ) => {
			if ( storeName === 'image-studio' ) {
				return {
					getSelectedAspectRatio: () => selectedAspectRatio,
					getEntryPoint: () => entryPoint,
				};
			}
			if ( storeName === 'core/editor' ) {
				return { getCurrentTemplateId: () => ( templateContent ? 'theme//single' : null ) };
			}
			if ( storeName === 'core' ) {
				return {
					getEditedEntityRecord: () =>
						templateContent ? { content: templateContent } : undefined,
				};
			}
			return null;
		} )
	);
}

function getOptionButton( name: string ) {
	return screen
		.getAllByRole( 'button', { name } )
		.find( ( button ) => button.classList.contains( 'image-studio-input-toolbar-card' ) );
}

describe( 'AspectRatioPicker', () => {
	it( 'shows 16:9 for a featured image session with no ratio picked', () => {
		mockStore( null, 'jetpack_ai_featured_image' );

		render( <AspectRatioPicker mode={ ImageStudioMode.Generate } /> );

		expect( screen.getAllByRole( 'button', { name: '16:9' } )[ 0 ] ).toBeInTheDocument();
		expect( getOptionButton( '16:9' ) ).toHaveClass( 'is-selected' );
	} );

	it( 'shows the theme ratio for a featured image session when the template sets one', () => {
		mockStore( null, 'jetpack_ai_featured_image', SINGLE_TEMPLATE );

		render( <AspectRatioPicker mode={ ImageStudioMode.Generate } /> );

		expect( screen.getAllByRole( 'button', { name: '4:3' } )[ 0 ] ).toBeInTheDocument();
		expect( getOptionButton( '4:3' ) ).toHaveClass( 'is-selected' );
		expect( getOptionButton( '16:9' ) ).not.toHaveClass( 'is-selected' );
	} );

	it( 'shows 3:2 for a featured image session when the template sets 3/2', () => {
		mockStore( null, 'jetpack_ai_featured_image', THREE_TWO_TEMPLATE );

		render( <AspectRatioPicker mode={ ImageStudioMode.Generate } /> );

		expect( screen.getAllByRole( 'button', { name: '3:2' } )[ 0 ] ).toBeInTheDocument();
		expect( getOptionButton( '3:2' ) ).toHaveClass( 'is-selected' );
		expect( getOptionButton( '16:9' ) ).not.toHaveClass( 'is-selected' );
	} );

	it( 'shows the picked ratio over the featured image default', () => {
		mockStore( '1:1', 'jetpack_ai_featured_image', SINGLE_TEMPLATE );

		render( <AspectRatioPicker mode={ ImageStudioMode.Generate } /> );

		expect( screen.getAllByRole( 'button', { name: '1:1' } )[ 0 ] ).toBeInTheDocument();
		expect( getOptionButton( '1:1' ) ).toHaveClass( 'is-selected' );
	} );

	it( 'shows no ratio for other sessions with no ratio picked', () => {
		mockStore( null, 'media_library', SINGLE_TEMPLATE );

		render( <AspectRatioPicker mode={ ImageStudioMode.Generate } /> );

		expect( screen.getByRole( 'button', { name: 'Aspect Ratio' } ) ).toBeInTheDocument();
	} );

	it( 'records the picked ratio and the mode', () => {
		const setSelectedAspectRatio = vi.fn();
		( useDispatch as Mock ).mockReturnValue( { setSelectedAspectRatio } );
		mockStore( null, 'jetpack_ai_featured_image', THREE_TWO_TEMPLATE );

		render( <AspectRatioPicker mode={ ImageStudioMode.Generate } /> );
		fireEvent.click( getOptionButton( '4:3' ) as HTMLElement );

		expect( setSelectedAspectRatio ).toHaveBeenCalledWith( '4:3' );
		expect( trackImageStudioAspectRatioSelected ).toHaveBeenCalledWith( {
			aspectRatio: '4:3',
			mode: ImageStudioMode.Generate,
		} );
	} );

	it( 'offers the portrait pair of every landscape card', () => {
		const values = ASPECT_RATIO_OPTIONS.map( ( option ) => option.value );
		expect( values ).toEqual( [ '1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3' ] );
	} );

	it( 'offers every ratio a theme default can resolve to', () => {
		const values = ASPECT_RATIO_OPTIONS.map( ( option ) => option.value );
		THEME_ASPECT_RATIOS.forEach( ( ratio ) => expect( values ).toContain( ratio ) );
	} );
} );
