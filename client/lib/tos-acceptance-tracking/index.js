import { getLocaleSlug } from 'calypso/lib/i18n-utils';

export default function () {
	let viewportWidth = 0;
	let viewportHeight = 0;
	let path = '/';

	if ( 'undefined' !== typeof window ) {
		viewportWidth = window.document.documentElement.clientWidth;
		viewportHeight = window.document.documentElement.clientHeight;
		path = window.location.pathname;
	}

	return {
		path,
		locale: getLocaleSlug(),
		viewport: `${ viewportWidth }x${ viewportHeight }`,
	};
}
