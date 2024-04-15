import config, { isEnabled } from '@automattic/calypso-config';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { AllowedTypes } from '../../types';

/**
 * Returns link and tooltip for each feature based on status
 * which will be used to format row values. link will be used
 * to redirect the user when clicked on the row and tooltip is
 * used to show the tooltip when hovered over the row
 */
const getLinks = (
	type: AllowedTypes,
	status: string,
	siteUrl: string,
	siteUrlWithScheme: string,
	isAtomicSite: boolean
): {
	link: string;
	isExternalLink: boolean;
} => {
	let link = '';
	let isExternalLink = false;

	//const siteUrlWithMultiSiteSupport = urlToSlug( siteUrl );

	const isWPCOMAtomicSiteCreationEnabled = isEnabled(
		'jetpack/pro-dashboard-wpcom-atomic-hosting'
	);

	switch ( type ) {
		case 'site': {
			link =
				isWPCOMAtomicSiteCreationEnabled && isAtomicSite
					? `https://wordpress.com/home/${ urlToSlug( siteUrl ) }`
					: `/activity-log/${ urlToSlug( siteUrl ) }`;
			isExternalLink = isWPCOMAtomicSiteCreationEnabled && isAtomicSite;
			break;
		}
		case 'last_publish': {
			link = '';
			isExternalLink = false;
			break;
		}
		case 'status': {
			link = '';
			isExternalLink = false;
			break;
		}
		case 'plan': {
			link = '';
			isExternalLink = false;
			break;
		}
		case 'stats': {
			link = '';
			isExternalLink = false;
			break;
		}
	}
	return { link, isExternalLink };
};

export default getLinks;
