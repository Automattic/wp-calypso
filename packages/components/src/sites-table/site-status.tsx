import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';

export const siteLaunchStatuses = [ 'public', 'private', 'coming-soon' ] as const;

export type SiteLaunchStatus = typeof siteLaunchStatuses[ number ];

export interface SiteObjectWithStatus {
	is_coming_soon?: boolean;
	is_private?: boolean;
	launch_status?: string;
}

export const getSiteLaunchStatus = ( site: SiteObjectWithStatus ): SiteLaunchStatus => {
	if ( site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' ) ) {
		return 'coming-soon';
	}

	if ( site.is_private ) {
		return 'private';
	}

	return 'public';
};

export const useTranslatedSiteLaunchStatuses = (): { [ K in SiteLaunchStatus ]: string } => {
	const { __ } = useI18n();

	return useMemo(
		() => ( {
			'coming-soon': __( 'Coming soon' ),
			private: __( 'Private' ),
			public: __( 'Public' ),
		} ),
		[ __ ]
	);
};

export const useSiteLaunchStatusLabel = ( site: SiteObjectWithStatus ) => {
	const translatedStatuses = useTranslatedSiteLaunchStatuses();

	return translatedStatuses[ getSiteLaunchStatus( site ) ];
};
