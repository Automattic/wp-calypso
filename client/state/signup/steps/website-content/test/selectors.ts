// @ts-nocheck - TODO: Fix TypeScript issues
import { ABOUT_PAGE, HOME_PAGE, PORTFOLIO_PAGE } from '../../../../../signup/difm/constants';
import { initialState, MEDIA_UPLOAD_STATES } from '../constants';
import {
	getWebsiteContent,
	getWebsiteContentDataCollectionIndex,
	isMediaUploadInProgress,
} from '../selectors';

describe( 'selectors', () => {
	test( 'should return the initial state as a default state', () => {
		expect( getWebsiteContent( { signup: undefined } ) ).toEqual( {
			pages: [],
			siteInformationSection: { siteLogoUrl: '', searchTerms: '' },
			feedbackSection: { genericFeedback: '' },
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

	test( 'ismediaUploadInProgress should return true if at least one image is uploading', () => {
		expect(
			isMediaUploadInProgress( {
				signup: {
					steps: {
						websiteContentCollection: {
							...initialState,
							mediaUploadStates: {
								[ PORTFOLIO_PAGE ]: { 0: MEDIA_UPLOAD_STATES.UPLOAD_STARTED },
								[ HOME_PAGE ]: {
									0: MEDIA_UPLOAD_STATES.UPLOAD_FAILED,
									1: MEDIA_UPLOAD_STATES.UPLOAD_FAILED,
								},
								[ ABOUT_PAGE ]: {
									0: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
									2: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
								},
							},
						},
					},
				},
			} )
		).toEqual( true );

		// Should return false since no media are currently uploading
		expect(
			isMediaUploadInProgress( {
				signup: {
					steps: {
						websiteContentCollection: {
							...initialState,
							mediaUploadStates: {
								Page1: { 0: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED },
								Page2: {
									0: MEDIA_UPLOAD_STATES.UPLOAD_FAILED,
									1: MEDIA_UPLOAD_STATES.UPLOAD_FAILED,
								},
								Page3: {
									0: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
									2: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
								},
							},
						},
					},
				},
			} )
		).toEqual( false );
	} );
} );
