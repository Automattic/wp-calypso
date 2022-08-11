import { useI18n } from '@wordpress/react-i18n';

export const siteStatuses = [ 'coming-soon', 'private', 'public' ] as const;

export type SiteStatus = typeof siteStatuses[ number ];

export interface SiteObjectWithStatus {
	is_coming_soon?: boolean;
	is_private?: boolean;
	launch_status?: string;
}

export const getSiteStatus = ( site: SiteObjectWithStatus ): SiteStatus => {
	if ( site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' ) ) {
		return 'coming-soon';
	}

	if ( site.is_private ) {
		return 'private';
	}

	return 'public';
};

export const useTranslatedSiteStatus = ( site: SiteObjectWithStatus ) => {
	const { __ } = useI18n();

	if ( getSiteStatus( site ) === 'coming-soon' ) {
		return __( 'Coming soon' );
	}

	if ( getSiteStatus( site ) === 'private' ) {
		return __( 'Private' );
	}

	return __( 'Public' );
};
