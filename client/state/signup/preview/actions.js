/**
 * Internal dependencies
 */
import { SIGNUP_SITE_PREVIEW_SHOW, SIGNUP_SITE_PREVIEW_HIDE } from 'state/action-types';

/**
 * Action creator: Hide signup site preview
 *
 * @return {Object} The action object.
 */
export const hideSitePreview = () => ( {
	type: SIGNUP_SITE_PREVIEW_HIDE,
} );

/**
 * Action creator: Show signup site preview
 *
 * @return {Object} The action object.
 */
export const showSitePreview = () => ( {
	type: SIGNUP_SITE_PREVIEW_SHOW,
} );
