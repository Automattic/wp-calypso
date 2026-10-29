import { ImageStudioEntryPoint } from '../store';
import { getDefaultAspectRatio } from './default-aspect-ratio';

describe( 'getDefaultAspectRatio', () => {
	it.each( [
		ImageStudioEntryPoint.JetpackAIFeaturedImage,
		ImageStudioEntryPoint.JetpackExternalMediaFeaturedImage,
	] )( 'starts %s at 16:9', ( entryPoint ) => {
		expect( getDefaultAspectRatio( entryPoint ) ).toBe( '16:9' );
	} );

	it.each( [
		ImageStudioEntryPoint.MediaLibrary,
		ImageStudioEntryPoint.EditorBlock,
		ImageStudioEntryPoint.JetpackAISocialMedia,
		null,
	] )( 'leaves %s to the model', ( entryPoint ) => {
		expect( getDefaultAspectRatio( entryPoint ) ).toBeNull();
	} );
} );
