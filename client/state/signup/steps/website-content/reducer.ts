import {
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_TEXT_CHANGED,
	SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_REMOVED,
	SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { schema, initialState, WebsiteContentCollection, PageData } from './schema';
import type { AnyAction } from 'redux';

export const IMAGE_UPLOAD_STATES = {
	UPLOAD_STARTED: 'UPLOAD_STARTED',
	UPLOAD_COMPLETED: 'UPLOAD_COMPLETED',
	UPLOAD_FAILED: 'UPLOAD_FAILED',
	UPLOAD_REMOVED: 'UPLOAD_REMOVED',
};

export const LOGO_SECTION_ID = 'logo_section';

export default withSchemaValidation(
	schema,
	( state = initialState, action: AnyAction ): WebsiteContentCollection => {
		switch ( action.type ) {
			case SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES: {
				// When initializing page we need to leave pages that already exist alone
				// so that persisted state can load correctly
				const newPages = action.payload.map( ( page: PageData ) => ( {
					...page,
					...state.websiteContent.pages.find( ( oldPage ) => oldPage.id === page.id ),
				} ) );

				return {
					...state,
					websiteContent: { ...state.websiteContent, pages: newPages },
					imageUploadStates: {},
				};
			}
			case SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX:
				return {
					...state,
					currentIndex: action.payload,
				};
			case SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_FAILED:
			case SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED: {
				return {
					...state,
					imageUploadStates: {
						...state.imageUploadStates,
						[ LOGO_SECTION_ID ]: {
							...state.imageUploadStates[ LOGO_SECTION_ID ],
							[ 0 ]:
								action.type === SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED
									? IMAGE_UPLOAD_STATES.UPLOAD_STARTED
									: IMAGE_UPLOAD_STATES.UPLOAD_FAILED,
						},
					},
				};
			}

			case SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_COMPLETED: {
				const { payload } = action;
				const { url } = payload;
				return {
					...state,
					websiteContent: {
						...state.websiteContent,
						siteLogoUrl: url,
					},
					imageUploadStates: {
						...state.imageUploadStates,
						[ LOGO_SECTION_ID ]: {
							...state.imageUploadStates[ LOGO_SECTION_ID ],
							[ 0 ]: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
						},
					},
				};
			}

			case SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL: {
				return {
					...state,
					websiteContent: {
						...state.websiteContent,
						siteLogoUrl: '',
					},
					imageUploadStates: {
						...state.imageUploadStates,
						[ LOGO_SECTION_ID ]: {
							...state.imageUploadStates[ LOGO_SECTION_ID ],
							[ 0 ]: IMAGE_UPLOAD_STATES.UPLOAD_REMOVED,
						},
					},
				};
			}

			case SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_STARTED: {
				const { payload } = action;

				return {
					...state,
					imageUploadStates: {
						...state.imageUploadStates,
						[ payload.pageId ]: {
							...state.imageUploadStates[ payload.pageId ],
							[ payload.mediaIndex ]: IMAGE_UPLOAD_STATES.UPLOAD_STARTED,
						},
					},
				};
			}

			case SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_COMPLETED: {
				const { payload } = action;
				const { pageId } = payload;

				const imageUploadStates = {
					...state.imageUploadStates,
					[ pageId ]: {
						...state.imageUploadStates[ pageId ],
						[ payload.mediaIndex ]: IMAGE_UPLOAD_STATES.UPLOAD_COMPLETED,
					},
				};

				const pageIndex = state.websiteContent.pages.findIndex( ( page ) => page.id === pageId );

				const changedPage = state.websiteContent.pages[ pageIndex ];
				const newImages = [ ...changedPage.images ];
				newImages.splice( payload.mediaIndex, 1, payload.image );

				return {
					...state,
					websiteContent: {
						...state.websiteContent,
						pages: [
							...state.websiteContent.pages.slice( 0, pageIndex ),
							{
								...changedPage,
								images: newImages,
							},
							...state.websiteContent.pages.slice( pageIndex + 1 ),
						],
					},

					imageUploadStates: imageUploadStates,
				};
			}

			case SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOAD_FAILED: {
				const { payload } = action;

				return {
					...state,
					imageUploadStates: {
						...state.imageUploadStates,
						[ payload.pageId ]: {
							...state.imageUploadStates[ payload.pageId ],
							[ payload.mediaIndex ]: IMAGE_UPLOAD_STATES.UPLOAD_FAILED,
						},
					},
				};
			}

			case SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_REMOVED: {
				const { payload } = action;
				const { pageId } = payload;

				const pageIndex = state.websiteContent.pages.findIndex( ( page ) => page.id === pageId );

				const changedPage = state.websiteContent.pages[ pageIndex ];
				const newImages = [ ...changedPage.images ];
				newImages.splice( payload.mediaIndex, 1, { caption: '', url: '' } );

				return {
					...state,
					websiteContent: {
						...state.websiteContent,
						pages: [
							...state.websiteContent.pages.slice( 0, pageIndex ),
							{
								...changedPage,
								images: newImages,
							},
							...state.websiteContent.pages.slice( pageIndex + 1 ),
						],
					},
					imageUploadStates: {
						...state.imageUploadStates,
						[ payload.pageId ]: {
							...state.imageUploadStates[ payload.pageId ],
							[ payload.mediaIndex ]: IMAGE_UPLOAD_STATES.UPLOAD_REMOVED,
						},
					},
				};
			}

			case SIGNUP_STEPS_WEBSITE_CONTENT_TEXT_CHANGED: {
				const { payload } = action;

				const pageIndex = state.websiteContent.pages.findIndex(
					( page ) => page.id === payload.pageId
				);

				const changedPage = state.websiteContent.pages[ pageIndex ];

				return {
					...state,
					websiteContent: {
						...state.websiteContent,
						pages: [
							...state.websiteContent.pages.slice( 0, pageIndex ),
							{
								...changedPage,
								content: payload.content,
							},
							...state.websiteContent.pages.slice( pageIndex + 1 ),
						],
					},
				};
			}
			case SIGNUP_COMPLETE_RESET: {
				return initialState;
			}
		}
		return state;
	}
);
