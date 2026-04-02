import {
	userPreferenceQuery,
	userPreferenceOptimisticMutation,
	siteWordPressVersionQuery,
	wpOrgCoreVersionQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { canViewWordPressSettings } from '../features';
import type { Site } from '@automattic/api-core';

const PREFERENCE_KEY = 'hosting-dashboard-wp-beta-notice-dismissed' as const;

export function useShouldShowWpVersionNotice( site: Site ) {
	const canView = canViewWordPressSettings( site );
	const { data: isDismissed } = useSuspenseQuery(
		userPreferenceQuery( `${ PREFERENCE_KEY }-${ site.ID }` )
	);

	const { data: currentVersionTag } = useSuspenseQuery( {
		...siteWordPressVersionQuery( site.ID ),
		...( canView ? {} : { queryFn: () => Promise.resolve( '' ) } ),
	} );

	const { data: betaVersion } = useSuspenseQuery( {
		...wpOrgCoreVersionQuery( 'beta' ),
		...( canView ? {} : { queryFn: () => Promise.resolve( '' ) } ),
	} );

	// Don't show if already dismissed, already on beta, or no beta version available.
	return canView && ! isDismissed && currentVersionTag !== 'beta' && betaVersion;
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
