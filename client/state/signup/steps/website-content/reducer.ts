import {
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_FIELD_CHANGED,
	SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_REMOVED,
	SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL,
	SIGNUP_STEPS_WEBSITE_CONTENT_FEEDBACK_CHANGE,
} from 'calypso/state/action-types';
import { getSingleMediaPlaceholder, MediaUploadedData } from './actions';
import { initialState, LOGO_SECTION_ID, MEDIA_UPLOAD_STATES } from './constants';
import { WebsiteContentCollectionState } from './types';
import type { AnyAction } from 'redux';

export default ( state = initialState, action: AnyAction ): WebsiteContentCollectionState => {
	switch ( action.type ) {
		case SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES: {
			const { pages, siteLogoSection, feedbackSection } = action.payload;

			return {
				...initialState,
				websiteContent: {
					...initialState.websiteContent,
					pages,
					siteLogoSection,
					feedbackSection,
				},
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
				mediaUploadStates: {
					...state.mediaUploadStates,
					[ LOGO_SECTION_ID ]: {
						...state.mediaUploadStates[ LOGO_SECTION_ID ],
						[ 0 ]:
							action.type === SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED
								? MEDIA_UPLOAD_STATES.UPLOAD_STARTED
								: MEDIA_UPLOAD_STATES.UPLOAD_FAILED,
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
					siteLogoSection: { siteLogoUrl: url },
				},
				mediaUploadStates: {
					...state.mediaUploadStates,
					[ LOGO_SECTION_ID ]: {
						...state.mediaUploadStates[ LOGO_SECTION_ID ],
						[ 0 ]: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
					},
				},
			};
		}

		case SIGNUP_STEPS_WEBSITE_CONTENT_FEEDBACK_CHANGE: {
			const {
				payload: { feedback },
			} = action;
			return {
				...state,
				websiteContent: {
					...state.websiteContent,
					feedbackSection: { genericFeedback: feedback },
				},
			};
		}

		case SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL: {
			return {
				...state,
				websiteContent: {
					...state.websiteContent,
					siteLogoSection: { siteLogoUrl: '' },
				},
				mediaUploadStates: {
					...state.mediaUploadStates,
					[ LOGO_SECTION_ID ]: {
						...state.mediaUploadStates[ LOGO_SECTION_ID ],
						[ 0 ]: MEDIA_UPLOAD_STATES.UPLOAD_REMOVED,
					},
				},
			};
		}

		case SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_STARTED: {
			const { payload } = action;

			return {
				...state,
				mediaUploadStates: {
					...state.mediaUploadStates,
					[ payload.pageId ]: {
						...state.mediaUploadStates[ payload.pageId ],
						[ payload.mediaIndex ]: MEDIA_UPLOAD_STATES.UPLOAD_STARTED,
					},
				},
			};
		}

		case SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_COMPLETED: {
			const payload = action.payload as MediaUploadedData;
			const { pageId } = payload;

			const mediaUploadStates = {
				...state.mediaUploadStates,
				[ pageId ]: {
					...state.mediaUploadStates[ pageId ],
					[ payload.mediaIndex ]: MEDIA_UPLOAD_STATES.UPLOAD_COMPLETED,
				},
			};

			const pageIndex = state.websiteContent.pages.findIndex( ( page ) => page.id === pageId );

			const changedPage = state.websiteContent.pages[ pageIndex ];
			const newMediaItems = [ ...changedPage.media ];
			const removedItem = changedPage.media[ payload.mediaIndex ];
			newMediaItems.splice( payload.mediaIndex, 1, { ...removedItem, ...payload.media } );

			return {
				...state,
				websiteContent: {
					...state.websiteContent,
					pages: [
						...state.websiteContent.pages.slice( 0, pageIndex ),
						{
							...changedPage,
							media: newMediaItems,
						},
						...state.websiteContent.pages.slice( pageIndex + 1 ),
					],
				},

				mediaUploadStates: mediaUploadStates,
			};
		}

		case SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_FAILED: {
			const { payload } = action;

			return {
				...state,
				mediaUploadStates: {
					...state.mediaUploadStates,
					[ payload.pageId ]: {
						...state.mediaUploadStates[ payload.pageId ],
						[ payload.mediaIndex ]: MEDIA_UPLOAD_STATES.UPLOAD_FAILED,
					},
				},
			};
		}

		case SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_REMOVED: {
			const { payload } = action;
			const { pageId } = payload;

			const pageIndex = state.websiteContent.pages.findIndex( ( page ) => page.id === pageId );

			const changedPage = state.websiteContent.pages[ pageIndex ];
			const newMediaItems = [ ...changedPage.media ];
			const removedMedia = newMediaItems[ payload.mediaIndex ];
			newMediaItems.splice(
				payload.mediaIndex,
				1,
				getSingleMediaPlaceholder( removedMedia.mediaType )
			);

			return {
				...state,
				websiteContent: {
					...state.websiteContent,
					pages: [
						...state.websiteContent.pages.slice( 0, pageIndex ),
						{
							...changedPage,
							media: newMediaItems,
						},
						...state.websiteContent.pages.slice( pageIndex + 1 ),
					],
				},
				mediaUploadStates: {
					...state.mediaUploadStates,
					[ payload.pageId ]: {
						...state.mediaUploadStates[ payload.pageId ],
						[ payload.mediaIndex ]: MEDIA_UPLOAD_STATES.UPLOAD_REMOVED,
					},
				},
			};
		}

		case SIGNUP_STEPS_WEBSITE_FIELD_CHANGED: {
			const { payload } = action;

			return {
				...state,
				websiteContent: {
					...state.websiteContent,
					pages: state.websiteContent.pages.map( ( page ) => {
						if ( payload.pageId === page.id ) {
							return {
								...page,
								[ payload.fieldName ]: payload.fieldValue,
							};
						}
						return page;
					} ),
				},
			};
		}
		case SIGNUP_COMPLETE_RESET: {
			return initialState;
		}
	}
	return state;
};
