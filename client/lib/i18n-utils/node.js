import config from '@automattic/calypso-config';

export const getLocaleSlug = () => config( 'i18n_default_locale_slug' );
