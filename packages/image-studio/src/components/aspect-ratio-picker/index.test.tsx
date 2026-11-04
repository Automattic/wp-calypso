/* eslint-disable import/order */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

jest.mock( '@automattic/agenttic-ui', () => ( {
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

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn( () => ( {} ) ),
	useSelect: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
} ) );

jest.mock( '../../store', () => ( {
	store: 'image-studio',
	ImageStudioEntryPoint: {
		JetpackAIFeaturedImage: 'jetpack_ai_featured_image',
		JetpackExternalMediaFeaturedImage: 'jetpack_external_media_featured_image',
	},
} ) );

jest.mock( '../icons/AspectRatioIcon', () => ( {
	AspectRatioIcon: () => null,
} ) );

// Import after mocks
import { useSelect } from '@wordpress/data';
import { THEME_ASPECT_RATIOS } from '../../utils/theme-aspect-ratio';
import { ASPECT_RATIO_OPTIONS, AspectRatioPicker } from './index';

const SINGLE_TEMPLATE = `<!-- wp:group -->
<div class="wp-block-group"><!-- wp:post-featured-image {"aspectRatio":"4/3"} /--></div>
<!-- /wp:group -->`;

function mockStore(
	selectedAspectRatio: string | null,
	entryPoint: string | null,
	templateContent: string | null = null
) {
	( useSelect as jest.Mock ).mockImplementation( ( selector ) =>
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

		render( <AspectRatioPicker /> );

		expect( screen.getAllByRole( 'button', { name: '16:9' } )[ 0 ] ).toBeInTheDocument();
		expect( getOptionButton( '16:9' ) ).toHaveClass( 'is-selected' );
	} );

	it( 'shows the theme ratio for a featured image session when the template sets one', () => {
		mockStore( null, 'jetpack_ai_featured_image', SINGLE_TEMPLATE );

		render( <AspectRatioPicker /> );

		expect( screen.getAllByRole( 'button', { name: '4:3' } )[ 0 ] ).toBeInTheDocument();
		expect( getOptionButton( '4:3' ) ).toHaveClass( 'is-selected' );
		expect( getOptionButton( '16:9' ) ).not.toHaveClass( 'is-selected' );
	} );

	it( 'shows the picked ratio over the featured image default', () => {
		mockStore( '1:1', 'jetpack_ai_featured_image', SINGLE_TEMPLATE );

		render( <AspectRatioPicker /> );

		expect( screen.getAllByRole( 'button', { name: '1:1' } )[ 0 ] ).toBeInTheDocument();
		expect( getOptionButton( '1:1' ) ).toHaveClass( 'is-selected' );
	} );

	it( 'shows no ratio for other sessions with no ratio picked', () => {
		mockStore( null, 'media_library', SINGLE_TEMPLATE );

		render( <AspectRatioPicker /> );

		expect( screen.getByRole( 'button', { name: 'Aspect Ratio' } ) ).toBeInTheDocument();
	} );

	it( 'offers every ratio a theme default can resolve to', () => {
		const values = ASPECT_RATIO_OPTIONS.map( ( option ) => option.value );
		THEME_ASPECT_RATIOS.forEach( ( ratio ) => expect( values ).toContain( ratio ) );
	} );
} );
