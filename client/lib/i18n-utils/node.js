/** @format */

/**
 * Internal dependencies
 */

import config from 'config';

export * from './utils';
export const getLocaleSlug = () => config( 'i18n_default_locale_slug' );
