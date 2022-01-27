import {
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE,
	SIGNUP_COMPLETE_RESET,
	SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOADED,
	SIGNUP_STEPS_WEBSITE_CONTENT_TEXT_CHANGED,
	SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
} from 'calypso/state/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { schema, initialState, WebsiteContentCollection, PageData } from './schema';
import type { AnyAction } from 'redux';

export default withSchemaValidation(
	schema,
	( state = initialState, action: AnyAction ): WebsiteContentCollection => {
		switch ( action.type ) {
			case SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE:
				return {
					...state,
					websiteContent: action.payload,
				};
			case SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES: {
				// Initialize with provided pages only if given pages do not exist
				// When initializing page we need to leave pages that already exist alone
				// so that persisted state can load correctly
				const existingPageIDs = state.websiteContent.map( ( page ) => page.id );
				const newPages = action.payload.filter(
					( page: PageData ) => ! existingPageIDs.includes( page.id )
				);
				return {
					...state,
					websiteContent: [ ...state.websiteContent, ...newPages ],
				};
			}
			case SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX:
				return {
					...state,
					currentIndex: action.payload,
				};

			case SIGNUP_STEPS_WEBSITE_CONTENT_IMAGE_UPLOADED: {
				const { payload } = action;

				const pageIndex = state.websiteContent.findIndex( ( page ) => page.id === payload.id );
				const changedPage = state.websiteContent[ pageIndex ];
				const newImages = [ ...changedPage.images ];
				newImages.splice( payload.mediaIndex, 1, payload.image );

				return {
					...state,
					websiteContent: [
						...state.websiteContent.slice( 0, pageIndex ),
						{
							...changedPage,
							images: newImages,
						},
						...state.websiteContent.slice( pageIndex + 1 ),
					],
				};
			}
			case SIGNUP_STEPS_WEBSITE_CONTENT_TEXT_CHANGED: {
				const { payload } = action;

				const pageIndex = state.websiteContent.findIndex( ( page ) => page.id === payload.id );
				const changedPage = state.websiteContent[ pageIndex ];
				return {
					...state,
					websiteContent: [
						...state.websiteContent.slice( 0, pageIndex ),
						{
							...changedPage,
							content: payload.content,
						},
						...state.websiteContent.slice( pageIndex + 1 ),
					],
				};
			}
			case SIGNUP_COMPLETE_RESET: {
				return initialState;
			}
		}
		return state ?? initialState;
	}
);
