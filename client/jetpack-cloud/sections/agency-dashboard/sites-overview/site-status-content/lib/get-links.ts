import { isEnabled } from '@automattic/calypso-config';
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

	const siteUrlWithMultiSiteSupport = urlToSlug( siteUrl );

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
		case 'backup': {
			if ( status !== 'inactive' ) {
				link = isAtomicSite
					? `https://wordpress.com/backup/${ siteUrlWithMultiSiteSupport }`
					: `/backup/${ siteUrlWithMultiSiteSupport }`;
				isExternalLink = isAtomicSite;
			}
			break;
		}
		case 'scan': {
			if ( status !== 'inactive' ) {
				link = isAtomicSite
					? `https://wordpress.com/scan/${ siteUrlWithMultiSiteSupport }`
					: `/scan/${ siteUrlWithMultiSiteSupport }`;
				isExternalLink = isAtomicSite;
			}
			break;
		}
		case 'monitor': {
			if ( status === 'failed' ) {
				link = `https://jptools.wordpress.com/debug/?url=${ siteUrl }`;
				isExternalLink = true;
			} else {
				link = `${ siteUrlWithScheme }/wp-admin/admin.php?page=jetpack#/settings`;
				isExternalLink = true;
			}
			break;
		}
		case 'plugin': {
			link = `${ siteUrlWithScheme }/wp-admin/plugins.php`;
			isExternalLink = true;
			if ( ! isAtomicSite ) {
				link =
					status === 'warning'
						? `/plugins/updates/${ siteUrlWithMultiSiteSupport }`
						: `/plugins/manage/${ siteUrlWithMultiSiteSupport }`;
				isExternalLink = false;
			}
			break;
		}
	}
	return { link, isExternalLink };
};

export default getLinks;
