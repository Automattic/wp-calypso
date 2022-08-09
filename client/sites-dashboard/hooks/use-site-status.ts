import { useI18n } from '@wordpress/react-i18n';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import type { SiteStatus } from '@automattic/components';

interface UseSiteStatusResult {
	status: SiteStatus;
	translatedStatus: string;
}

export const useSiteStatus = ( site: SiteExcerptData ): UseSiteStatusResult => {
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
