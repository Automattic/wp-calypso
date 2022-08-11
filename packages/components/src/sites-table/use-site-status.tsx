import { useI18n } from '@wordpress/react-i18n';

export type SiteStatus = 'all' | 'coming-soon' | 'private' | 'public';

export interface SiteObjectWithStatus {
	is_coming_soon?: boolean;
	is_private?: boolean;
	launch_status?: string;
}

interface UseSiteStatusResult {
	status: SiteStatus;
	translatedStatus: string;
}

export const useSiteStatus = ( site: SiteObjectWithStatus ): UseSiteStatusResult => {
	const { __ } = useI18n();

	const isComingSoon =
		site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' );

	if ( isComingSoon ) {
		return {
			status: 'coming-soon',
			translatedStatus: __( 'Coming soon' ),
		};
	}

	if ( site.is_private ) {
		return {
			status: 'private',
			translatedStatus: __( 'Private' ),
		};
	}

	return {
		status: 'public',
		translatedStatus: __( 'Public' ),
	};
};
