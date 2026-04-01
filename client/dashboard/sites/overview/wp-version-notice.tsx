import {
	userPreferenceQuery,
	userPreferenceOptimisticMutation,
	siteWordPressVersionQuery,
	wpOrgCoreVersionQuery,
} from '@automattic/api-queries';
import { useSuspenseQuery, useQuery, useMutation } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import type { Site } from '@automattic/api-core';

const PREFERENCE_KEY = 'hosting-dashboard-wp-beta-notice-dismissed' as const;

export function WpVersionNotice( { site }: { site: Site } ) {
	const { data: isDismissed } = useSuspenseQuery(
		userPreferenceQuery( `${ PREFERENCE_KEY }-${ site.ID }` )
	);
	const { mutate: dismiss } = useMutation(
		userPreferenceOptimisticMutation( `${ PREFERENCE_KEY }-${ site.ID }` )
	);

	const { data: currentVersionTag } = useQuery( siteWordPressVersionQuery( site.ID ) );
	const { data: betaVersion } = useQuery( wpOrgCoreVersionQuery( 'beta' ) );

	// Don't show if already dismissed, already on beta, or no beta version available.
	if ( isDismissed || currentVersionTag === 'beta' || ! betaVersion ) {
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
