/**
 * Internal dependencies
 */
import { SIGNUP_SITE_PREVIEW_SHOW, SIGNUP_SITE_PREVIEW_HIDE } from 'state/action-types';

/**
 * Internal dependencies
 */
import 'state/signup/init';

/**
 * Action creator: Hide signup site preview
 *
 * @returns {object} The action object.
 */
export const hideSitePreview = () => ( {
	type: SIGNUP_SITE_PREVIEW_HIDE,
} );

/**
 * Action creator: Show signup site preview
 *
 * @returns {object} The action object.
 */
export const showSitePreview = () => ( {
	type: SIGNUP_SITE_PREVIEW_SHOW,
} );
