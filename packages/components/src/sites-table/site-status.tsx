import { useI18n } from '@wordpress/react-i18n';

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

export const getTranslatedSiteLaunchStatuses = (
	__: ReturnType< typeof useI18n >[ '__' ]
): { [ K in SiteLaunchStatus ]: string } => {
	return {
		'coming-soon': __( 'Coming soon' ),
		private: __( 'Private' ),
		public: __( 'Public' ),
	};
};

export const useSiteLaunchStatusLabel = ( site: SiteObjectWithStatus ) => {
	const { __ } = useI18n();
	const translatedStatuses = getTranslatedSiteLaunchStatuses( __ );

	return translatedStatuses[ getSiteLaunchStatus( site ) ];
};
