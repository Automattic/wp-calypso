import {
	userPreferenceOptimisticMutation,
	siteWordPressVersionQuery,
	wpOrgCoreVersionQuery,
	rawUserPreferencesQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { canViewWordPressSettings } from '../features';
import type { Site, UserPreferences } from '@automattic/api-core';

const PREFERENCE_KEY = 'hosting-dashboard-wp-beta-notice-dismissed' as const;

export function shouldLoadWpVersionNotice( site: Site, preferences: UserPreferences ) {
	const canView = canViewWordPressSettings( site ) && ! site.is_wpcom_staging_site;
	const isDismissed = preferences[ `${ PREFERENCE_KEY }-${ site.ID }` ];

	return canView && ! isDismissed;
}

export function useShouldShowWpVersionNotice( site: Site ) {
	const { data: preferences } = useSuspenseQuery( rawUserPreferencesQuery() );
	const shouldLoad = shouldLoadWpVersionNotice( site, preferences );

	const { data: currentVersionTag } = useQuery( {
		...siteWordPressVersionQuery( site.ID ),
		enabled: shouldLoad,
	} );

	const { data: betaVersion } = useQuery( {
		...wpOrgCoreVersionQuery( 'beta' ),
		enabled: shouldLoad,
	} );

	// Don't show if already already on beta, or no beta version available.
	return shouldLoad && currentVersionTag !== 'beta' && betaVersion;
}

export function WpVersionNotice( { site }: { site: Site } ) {
	const shouldShow = useShouldShowWpVersionNotice( site );

	const { mutate: dismiss } = useMutation(
		userPreferenceOptimisticMutation( `${ PREFERENCE_KEY }-${ site.ID }` )
	);

	const { data: betaVersion } = useSuspenseQuery( wpOrgCoreVersionQuery( 'beta' ) );

	if ( ! shouldShow ) {
		return null;
	}

	return (
		<Notice
			variant="info"
			title={ sprintf(
				// translators: %s: WordPress version number, e.g. "7.0"
				__( 'WordPress %s is available for early access' ),
				betaVersion
			) }
			onClose={ () => dismiss( new Date().toISOString() ) }
			actions={
				<RouterLinkButton variant="primary" to={ `/sites/${ site.slug }/settings/wordpress` }>
					{ __( 'Try it now' ) }
				</RouterLinkButton>
			}
		>
			{ __(
				'You can switch your site to the latest beta version of WordPress from your site settings. A backup is created automatically before every switch.'
			) }
		</Notice>
	);
}
