import {
	userNotificationsExtrasSettingsMutation,
	userNotificationsSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import {
	WPCOM_OPTION_KEYS,
	WPCOM_TITLES,
	WPCOM_DESCRIPTIONS,
	JETPACK_OPTION_KEYS,
	JETPACK_TITLES,
	JETPACK_DESCRIPTIONS,
} from './extras-config';
import { ExtrasToggleCard } from './extras-toggle-card';
import type { WpcomNotificationSettings } from '@automattic/api-core';

export default function NotificationsExtras() {
	const { data } = useSuspenseQuery( userNotificationsSettingsQuery() );
	const { recordTracksEvent } = useAnalytics();

	const mutation = useMutation( {
		...userNotificationsExtrasSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Subscription settings saved.' ),
				error: __( 'Failed to save subscription settings.' ),
			},
		},
	} );

	const extraSettings: Partial< WpcomNotificationSettings > | undefined = data?.wpcom;
	const isSaving = mutation.isPending;
	const onMutate =
		( group: 'wpcom' | 'jetpack' ) =>
		( payload: Partial< WpcomNotificationSettings >, origin: string ) => {
			if ( origin === 'subscribe-all' ) {
				recordTracksEvent( 'calypso_dashboard_notifications_extras_subscribe_all', {
					settings_group: group,
				} );
			}

			if ( origin === 'unsubscribe-all' ) {
				recordTracksEvent( 'calypso_dashboard_notifications_extras_unsubscribe_all', {
					settings_group: group,
				} );
			}

			recordTracksEvent( 'calypso_dashboard_notifications_extras_single', {
				...Object.keys( payload ).reduce( ( acc, key ) => {
					return {
						...acc,
						settings_name: key,
						settings_value: payload[ key as keyof WpcomNotificationSettings ] as boolean,
						settings_group: group,
					};
				}, {} ),
			} );

			mutation.mutate( payload );
		};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Extras' ) }
					description={ __(
						'Get curated extras like reports, digests, and community updates, so you can stay tuned for what’s happening in the WordPress ecosystem.'
					) }
				/>
			}
		>
			<VStack spacing={ 8 }>
				<ExtrasToggleCard
					extraSettings={ extraSettings }
					isSaving={ isSaving }
					onMutate={ onMutate( 'wpcom' ) }
					optionKeys={ WPCOM_OPTION_KEYS }
					titles={ WPCOM_TITLES }
					descriptions={ WPCOM_DESCRIPTIONS }
					sectionTitle={ __( 'Email from WordPress.com' ) }
				/>

				<ExtrasToggleCard
					extraSettings={ extraSettings }
					isSaving={ isSaving }
					onMutate={ onMutate( 'jetpack' ) }
					optionKeys={ JETPACK_OPTION_KEYS }
					titles={ JETPACK_TITLES }
					descriptions={ JETPACK_DESCRIPTIONS }
					sectionTitle={ __( 'Email from Jetpack' ) }
					sectionDescription={
						<Text variant="muted" lineHeight="20px">
							{ __(
								'Jetpack is a suite of tools connected to your WordPress site, like backups, security, and performance reports.'
							) }
						</Text>
					}
				/>
			</VStack>
		</PageLayout>
	);
}
