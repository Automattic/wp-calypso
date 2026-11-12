import { ImageStudioEntryPoint } from '../store';
import { getDefaultAspectRatio } from './default-aspect-ratio';

const FEATURED_ENTRY_POINTS = [
	ImageStudioEntryPoint.JetpackAIFeaturedImage,
	ImageStudioEntryPoint.JetpackExternalMediaFeaturedImage,
];

const OTHER_ENTRY_POINTS = [
	ImageStudioEntryPoint.MediaLibrary,
	ImageStudioEntryPoint.EditorBlock,
	ImageStudioEntryPoint.JetpackAISocialMedia,
	ImageStudioEntryPoint.PostEditorFeatureClip,
	null,
];

function selectWithTemplate( content: string | null ) {
	return ( storeName: string ) => {
		if ( storeName === 'core/editor' ) {
			return { getCurrentTemplateId: () => ( content ? 'theme//single' : null ) };
		}
		if ( storeName === 'core' ) {
			return { getEditedEntityRecord: () => ( content ? { content } : undefined ) };
		}
		return null;
	};
}

const noTemplate = selectWithTemplate( null );
const themeWith43 = selectWithTemplate( '<!-- wp:post-featured-image {"aspectRatio":"4/3"} /-->' );
const themeWith32 = selectWithTemplate( '<!-- wp:post-featured-image {"aspectRatio":"3/2"} /-->' );
const themeWith34 = selectWithTemplate( '<!-- wp:post-featured-image {"aspectRatio":"3/4"} /-->' );
const themeWith169 = selectWithTemplate(
	'<!-- wp:post-featured-image {"aspectRatio":"16/9"} /-->'
);

describe( 'getDefaultAspectRatio', () => {
	it.each( FEATURED_ENTRY_POINTS )(
		'starts %s at 16:9 when the theme sets no ratio',
		( entryPoint ) => {
			expect( getDefaultAspectRatio( entryPoint, noTemplate ) ).toBe( '16:9' );
		}
	);

	it.each( FEATURED_ENTRY_POINTS )(
		'starts %s at the theme ratio when the picker offers it',
		( entryPoint ) => {
			expect( getDefaultAspectRatio( entryPoint, themeWith43 ) ).toBe( '4:3' );
			expect( getDefaultAspectRatio( entryPoint, themeWith32 ) ).toBe( '3:2' );
			expect( getDefaultAspectRatio( entryPoint, themeWith169 ) ).toBe( '16:9' );
		}
	);

	it.each( FEATURED_ENTRY_POINTS )(
		'starts %s at 16:9 when the theme ratio is portrait',
		( entryPoint ) => {
			expect( getDefaultAspectRatio( entryPoint, themeWith34 ) ).toBe( '16:9' );
		}
	);

	it.each( OTHER_ENTRY_POINTS )(
		'leaves %s to the model without reading the theme',
		( entryPoint ) => {
			const select = jest.fn( themeWith43 );
			expect( getDefaultAspectRatio( entryPoint, select ) ).toBeNull();
			expect( select ).not.toHaveBeenCalled();
		}
	);
} );
