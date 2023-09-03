import {
	ErrorResponse,
	SiteSubscriptionDetails,
	SiteSubscriptionDetailsErrorResponse,
} from '../types';

export const isErrorResponse = ( response: unknown ): response is ErrorResponse => {
	return (
		typeof response === 'object' &&
		response !== null &&
		( 'errors' in response || 'error_data' in response )
	);
};

export const isSiteSubscriptionDetails = (
	obj: unknown
): obj is SiteSubscriptionDetails< string > => {
	if ( ! obj || typeof obj !== 'object' ) {
		return false;
	}

	const siteSubscriptionDetails = obj as SiteSubscriptionDetails;
	return (
		typeof siteSubscriptionDetails?.ID === 'number' &&
		typeof siteSubscriptionDetails?.blog_ID === 'number' &&
		typeof siteSubscriptionDetails?.name === 'string' &&
		typeof siteSubscriptionDetails?.URL === 'string'
	);
};

export const isSiteSubscriptionDetailsErrorResponse = (
	obj: unknown
): obj is SiteSubscriptionDetailsErrorResponse => {
	return isErrorResponse( obj );
};
