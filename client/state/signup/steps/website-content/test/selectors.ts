import { IMAGE_UPLOAD_STATES } from '../reducer';
import { initialState } from '../schema';
import {
	getWebsiteContent,
	getWebsiteContentDataCollectionIndex,
	isImageUploadInProgress,
} from '../selectors';

describe( 'selectors', () => {
	test( 'should return the initial state as a default state', () => {
		expect( getWebsiteContent( { signup: undefined } ) ).toEqual( {
			pages: [],
			siteLogoUrl: '',
		} );
	} );

	test( 'should return the web site content collection current index from the state', () => {
		expect(
			getWebsiteContentDataCollectionIndex( {
				signup: {
					steps: {
						websiteContentCollection: {
							...initialState,
							currentIndex: 100,
						},
					},
				},
			} )
		).toEqual( 100 );
	} );

	test( 'isImageUploadInProgress should return true if at least one image is uploading', () => {
		expect(
			isImageUploadInProgress( {
				signup: {
					steps: {
						websiteContentCollection: {
							...initialState,
							imageUploadStates: {
								Page1: { 0: IMAGE_UPLOAD_STATES.UPLOAD_STARTED },
								Page2: {
									0: IMAGE_UPLOAD_STATES.UPLOAD_FAILED,
									1: IMAGE_UPLOAD_STATES.UPLOAD_FAILED,
								},
								Page3: {
									0: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
									2: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
								},
							},
						},
					},
				},
			} )
		).toEqual( true );

		// Should return false since no images are currently uploading
		expect(
			isImageUploadInProgress( {
				signup: {
					steps: {
						websiteContentCollection: {
							...initialState,
							imageUploadStates: {
								Page1: { 0: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED },
								Page2: {
									0: IMAGE_UPLOAD_STATES.UPLOAD_FAILED,
									1: IMAGE_UPLOAD_STATES.UPLOAD_FAILED,
								},
								Page3: {
									0: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
									2: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
								},
							},
						},
					},
				},
			} )
		).toEqual( false );
	} );
} );
