import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';

export const siteLaunchStatuses = [
	'public',
	'private',
	'coming-soon',
	'redirect',
	'deleted',
] as const;

export type SiteLaunchStatus = ( typeof siteLaunchStatuses )[ number ];

export interface SiteObjectWithStatus {
	is_coming_soon?: boolean;
	is_private?: boolean;
	is_deleted?: boolean;
	launch_status?: string;
	options?: {
		is_redirect?: boolean;
	};
}

export const getSiteLaunchStatus = ( site: SiteObjectWithStatus ): SiteLaunchStatus => {
	if ( site.is_deleted ) {
		return 'deleted';
	}

	if ( site.options?.is_redirect ) {
		return 'redirect';
	}

	if ( site.is_coming_soon || ( site.is_private && site.launch_status === 'unlaunched' ) ) {
		return 'coming-soon';
	}

	if ( site.is_private ) {
		return 'private';
	}

	return 'public';
};

export const useTranslatedSiteLaunchStatuses = (): { [ K in SiteLaunchStatus ]: string } => {
	const { _x } = useI18n();

	return useMemo(
		() => ( {
			'coming-soon': _x( 'Coming soon', 'site' ),
			private: _x( 'Private', 'site' ),
			public: _x( 'Public', 'site' ),
			redirect: _x( 'Redirect', 'site' ),
			deleted: _x( 'Deleted', 'site' ),
		} ),
		[ _x ]
	);
};

export const useSiteLaunchStatusLabel = ( site: SiteObjectWithStatus ) => {
	const translatedStatuses = useTranslatedSiteLaunchStatuses();

	return translatedStatuses[ getSiteLaunchStatus( site ) ];
};
