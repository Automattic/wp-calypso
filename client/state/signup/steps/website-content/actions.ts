import {
	PHOTO_GALLERY_PAGE,
	PORTFOLIO_PAGE,
	PageId,
	CUSTOM_PAGE,
} from 'calypso/signup/difm/constants';
import { newInstanceId } from 'calypso/signup/difm/page-instances';
import {
	SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_FAILED,
	SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_COMPLETED,
	SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_REMOVED,
	SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL,
	SIGNUP_STEPS_WEBSITE_FIELD_CHANGED,
	SIGNUP_STEPS_WEBSITE_CONTENT_FEEDBACK_CHANGE,
	SIGNUP_STEPS_WEBSITE_CONTENT_CHANGES_SAVED,
	SIGNUP_STEPS_WEBSITE_CONTENT_SEARCH_TERMS_CHANGED,
} from 'calypso/state/action-types';
import type { Media, MediaUploadType, WebsiteContentServerState } from './types';
import type { TranslateResult } from 'i18n-calypso';
import 'calypso/state/signup/init';

export type MediaUploadedData = {
	pageId: string; // opaque PageData instance id
	mediaIndex: number;
	media: Partial< Media >;
};
export function mediaUploaded( data: MediaUploadedData ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_COMPLETED,
		payload: data,
	};
}

export function mediaRemoved( data: { pageId: string; mediaIndex: number } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_REMOVED,
		payload: data,
	};
}

export function mediaUploadInitiated( data: { pageId: string; mediaIndex: number } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_STARTED,
		payload: data,
	};
}

export function mediaUploadFailed( data: { pageId: string; mediaIndex: number } ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_MEDIA_UPLOAD_FAILED,
		payload: data,
	};
}

export function logoUploadStarted() {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_STARTED,
	};
}

export function logoUploadCompleted( url: string ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_COMPLETED,
		payload: { url },
	};
}

export function logoUploadFailed() {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_LOGO_UPLOAD_FAILED,
	};
}

export function logoRemoved() {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_REMOVE_LOGO_URL,
	};
}

export function updateFeedback( feedback: string ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_FEEDBACK_CHANGE,
		payload: { feedback },
	};
}

export function updateSearchTerms( searchTerms: string ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_SEARCH_TERMS_CHANGED,
		payload: { searchTerms },
	};
}

export function websiteContentFieldChanged( payload: {
	pageId: string;
	fieldName: string;
	fieldValue: string | boolean;
} ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_FIELD_CHANGED,
		payload,
	};
}

export function updateWebsiteContentCurrentIndex( currentIndex: number ) {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_UPDATE_CURRENT_INDEX,
		payload: currentIndex,
	};
}

export function getSingleMediaPlaceholder( mediaType: MediaUploadType ) {
	return { caption: '', url: '', mediaType: mediaType, thumbnailUrl: '' };
}

function getMediaPlaceholders( pageId: PageId ): Array< Media > {
	switch ( pageId ) {
		case PORTFOLIO_PAGE:
		case PHOTO_GALLERY_PAGE:
		case CUSTOM_PAGE:
			return Array( 8 ).fill( getSingleMediaPlaceholder( 'IMAGE-AND-VIDEO' ) );
		default:
			return Array( 4 ).fill( getSingleMediaPlaceholder( 'IMAGE-AND-VIDEO' ) );
	}
}

/**
 * Return the initial state for the page-wise media state.
 * Each page type supports a different number of media uploads (@see getMediaPlaceholders).
 */
function getInitialMediaState( pageId: PageId, savedMedia: Media[] | null | undefined ): Media[] {
	const mediaPlaceholders = getMediaPlaceholders( pageId );

	// Return placeholders if server state does not contain any media
	if ( ! savedMedia?.length ) {
		return mediaPlaceholders;
	}

	// Return server state if the number of items matches or exceeds the number of placeholders
	if ( savedMedia.length >= mediaPlaceholders.length ) {
		return savedMedia;
	}

	// If the number of items does not match the number of placeholders,
	// use server state and placeholders to return the correct number of items.
	return [
		...savedMedia,
		...mediaPlaceholders.slice( 0, mediaPlaceholders.length - savedMedia.length ),
	];
}

/**
 * Return the page title to be shown on the website content form.
 * Return the title of the saved page if it exists.
 * If the page is not a custom page, return the translated page title.
 * Else, return an empty string.
 */
function getInitialTitle( {
	pageId,
	savedTitle,
	translatedPageTitle,
}: {
	pageId: PageId;
	savedTitle?: string;
	translatedPageTitle: TranslateResult;
} ) {
	if ( savedTitle ) {
		return savedTitle;
	}
	if ( pageId !== CUSTOM_PAGE ) {
		return translatedPageTitle;
	}
	return '';
}

/**
 * This action essentially maps server state to local state.
 * When selectedPageInstances is present, one PageData is built per instance (id: instance.id)
 * so each custom page has distinct title/content. Otherwise falls back to selectedPageTitles
 * with order-based consumption of saved pages per type.
 */
export function initializeWebsiteContentForm(
	websiteContentServerState: WebsiteContentServerState,
	translatedPageTitles: Record< PageId, TranslateResult >
) {
	const {
		selectedPageTitles,
		selectedPageInstances,
		pages,
		siteLogoUrl,
		searchTerms,
		genericFeedback,
	} = websiteContentServerState;

	// Index saved pages by id (instance id or PageId) for direct lookup when using instances
	const pagesByInstanceId = pages.reduce< Record< string, ( typeof pages )[ 0 ] > >(
		( acc, page ) => {
			acc[ String( page.id ) ] = page;
			return acc;
		},
		{}
	);

	// When we have instances, build one PageData per instance; match saved content by instance id
	if ( selectedPageInstances?.length ) {
		const generatedPages = selectedPageInstances.map( ( instance ) => {
			const savedContent = pagesByInstanceId[ instance.id ];
			const pageId = instance.type;
			return {
				id: instance.id,
				type: pageId,
				title: getInitialTitle( {
					pageId,
					savedTitle: savedContent?.title ?? instance.title,
					translatedPageTitle: translatedPageTitles[ pageId ],
				} ),
				content: savedContent?.content ?? '',
				displayEmail: savedContent?.displayEmail || undefined,
				displayPhone: savedContent?.displayPhone || undefined,
				displayAddress: savedContent?.displayAddress || undefined,
				useFillerContent: savedContent?.useFillerContent || false,
				media: getInitialMediaState( pageId, savedContent?.media ),
			};
		} );

		return {
			type: SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
			payload: {
				pages: generatedPages,
				siteInformationSection: { siteLogoUrl, searchTerms },
				feedbackSection: { genericFeedback },
			},
		};
	}

	/**
	 * Fallback: no selectedPageInstances. There may be multiple pages of the same type.
	 * Align each selectedPageTitles entry with a corresponding saved page of the same id,
	 * consuming saved pages in order so that instances don't all point to the first match.
	 */
	const pagesById = pages.reduce<
		Partial< Record< PageId, WebsiteContentServerState[ 'pages' ] > >
	>( ( acc, page ) => {
		const list = acc[ page.id as PageId ] ?? [];
		list.push( page );
		acc[ page.id as PageId ] = list;
		return acc;
	}, {} );

	const usedIndexById: Partial< Record< PageId, number > > = {};

	const generatedPages = selectedPageTitles.map( ( pageId ) => {
		const listForId = pagesById[ pageId ] ?? [];
		const usedIndex = usedIndexById[ pageId ] ?? 0;
		const savedContent = listForId[ usedIndex ];

		usedIndexById[ pageId ] = usedIndex + 1;

		return {
			id: newInstanceId(),
			type: pageId,
			title: getInitialTitle( {
				pageId,
				savedTitle: savedContent?.title,
				translatedPageTitle: translatedPageTitles[ pageId ],
			} ),
			content: savedContent?.content ?? '',
			displayEmail: savedContent?.displayEmail || undefined,
			displayPhone: savedContent?.displayPhone || undefined,
			displayAddress: savedContent?.displayAddress || undefined,
			useFillerContent: savedContent?.useFillerContent || false,
			media: getInitialMediaState( pageId, savedContent?.media ),
		};
	} );

	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_INITIALIZE_PAGES,
		payload: {
			pages: generatedPages,
			siteInformationSection: { siteLogoUrl, searchTerms },
			feedbackSection: { genericFeedback },
		},
	};
}

export function changesSaved() {
	return {
		type: SIGNUP_STEPS_WEBSITE_CONTENT_CHANGES_SAVED,
	};
}
