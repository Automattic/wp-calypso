import { getLocaleSlug } from 'calypso/lib/i18n-utils';

export default function () {
	const width = window.document.documentElement.clientWidth;
	const height = window.document.documentElement.clientHeight;
	return {
		path: window.location.pathname,
		locale: getLocaleSlug(),
		viewport: `${ width }x${ height }`,
	};
}
