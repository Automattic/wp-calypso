import { userPreferenceMutation, userPreferenceQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { Notice } from '../../../components/notice';
import RouterLinkButton from '../../../components/router-link-button';
import { getMarketplaceHostingSectionRoute } from '../paths';
import type { Agency } from '@automattic/api-core';

// Shared with the classic dashboard so a dismissal carries over.
const DISMISS_PREFERENCE = 'pressable-limit-notification-dismissed' as const;

// The references the API sends, misspelling included.
const LIMIT_EXCEEDED_REFERENCE = 'pressable_plan_usage_limit_exeeded';
const LIMIT_APPROACHING_REFERENCE = 'pressable_plan_usage_limit_approaching';

export default function PressableUsageLimitNotice( {
	agency,
}: {
	agency: Agency | null | undefined;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: dismissedTimestamp, isFetched } = useQuery(
		userPreferenceQuery( DISMISS_PREFERENCE )
	);
	const { mutate: saveDismissed } = useMutation( userPreferenceMutation( DISMISS_PREFERENCE ) );

	const notifications = agency?.notifications ?? [];
	const exceeded = notifications.find(
		( notification ) => notification.reference === LIMIT_EXCEEDED_REFERENCE
	);
	const approaching = notifications.find(
		( notification ) => notification.reference === LIMIT_APPROACHING_REFERENCE
	);
	const notice = exceeded ?? approaching;

	if ( ! notice || ! isFetched || dismissedTimestamp === notice.timestamp ) {
		return null;
	}

	const dismiss = () => {
		saveDismissed( notice.timestamp );
		recordTracksEvent( 'calypso_a4a_pressable_limit_notification_dismissed', {
			type: notice.reference,
		} );
	};

	return (
		<Notice
			variant={ exceeded ? 'warning' : 'info' }
			title={ __( 'Upgrade Pressable' ) }
			onClose={ dismiss }
			actions={
				<RouterLinkButton
					variant="primary"
					size="compact"
					to={ getMarketplaceHostingSectionRoute( 'pressable' ) }
					onClick={ () =>
						recordTracksEvent( 'calypso_a4a_pressable_limit_notification_upgrade_click' )
					}
				>
					{ __( 'Upgrade now' ) }
				</RouterLinkButton>
			}
		>
			{ exceeded
				? __(
						'Your Pressable plan has exceeded its allocated limits. Consider upgrading your plan to avoid additional fees.'
				  )
				: __(
						'Your Pressable plan is close to exceeding its allocated limits. Consider upgrading your plan to avoid additional fees.'
				  ) }
		</Notice>
	);
}
