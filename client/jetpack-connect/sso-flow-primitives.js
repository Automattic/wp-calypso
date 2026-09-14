export function getAdminUrlFromBlogDetails( blogDetails ) {
	return blogDetails?.admin_url;
}

export function navigateToUrl( url ) {
	window.location.href = url;
}

export function navigateToAdminUrlWhenAvailable( blogDetails ) {
	const adminUrl = getAdminUrlFromBlogDetails( blogDetails );

	if ( ! adminUrl ) {
		return false;
	}

	navigateToUrl( adminUrl );
	return true;
}

export function fallbackToHistoryBackWhenAdminUrlMissing( blogDetails, event ) {
	if ( getAdminUrlFromBlogDetails( blogDetails ) ) {
		return false;
	}

	event?.preventDefault?.();
	window.history.back();
	return true;
}
