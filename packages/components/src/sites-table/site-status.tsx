import { useI18n } from '@wordpress/react-i18n';

export const siteStatuses = [ 'public', 'private', 'coming-soon' ] as const;

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

export const getTranslatedStatuses = (
	__: ReturnType< typeof useI18n >[ '__' ]
): { [ K in SiteStatus ]: string } => {
	return {
		'coming-soon': __( 'Coming soon' ),
		private: __( 'Private' ),
		public: __( 'Public' ),
	};
};

export const useTranslatedSiteStatus = ( site: SiteObjectWithStatus ) => {
	const { __ } = useI18n();
	const translatedStatuses = getTranslatedStatuses( __ );

	return translatedStatuses[ getSiteStatus( site ) ];
};
