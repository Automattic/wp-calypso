import { userNotificationsSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { type SettingsOption, SettingsPanel } from '../../../../../components/settings-panel';
import { useAnalytics } from '../../../../app/analytics';
import { getFieldLabel } from '../../helpers/translations';
import { useSiteSettings } from '../../hooks';
import { ApplySettingsToAllSitesConfirmationModal } from '../apply-settings-to-all-sites-confirmation-modal';

export const WebSettings = ( { siteId }: { siteId: number } ) => {
	const { data: blogSettings } = useSiteSettings( siteId );
	const { mutate: updateSettings, isPending: isUpdating } = useMutation(
		userNotificationsSettingsMutation()
	);
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const { recordTracksEvent } = useAnalytics();
	const timelineSettings = useMemo( () => blogSettings?.timeline ?? null, [ blogSettings ] );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleChange = ( updated: SettingsOption ) => {
		updateSettings(
			{
				data: {
					blogs: [
						{
							blog_id: siteId,
							timeline: { ...timelineSettings, [ updated.id ]: updated.value },
						},
					],
				},
			},
			{
				onSuccess: () => {
					createSuccessNotice(
						sprintf(
							/* translators: %s is the name of the setting */
							__( '"%s" settings saved.' ),
							updated.label
						),
						{
							type: 'snackbar',
						}
					);
					recordTracksEvent( 'calypso_dashboard_notifications_timeline_settings_updated', {
						setting_name: updated.id,
						setting_value: updated.value,
						site_id: siteId,
					} );
				},
				onError: () => {
					createErrorNotice( __( 'There was a problem saving your changes. Please, try again.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const askForConfirmation = () => {
		setIsConfirmDialogOpen( true );
	};

	const handleApplyAll = () => {
		if ( ! blogSettings ) {
			return;
		}

		updateSettings(
			{
				data: {
					blogs: [ blogSettings ],
				},
				applyToAll: true,
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_dashboard_notifications_settings_apply_to_all_sites', {
						// It is the site's settings that are being applied to other sites.
						stream: 'timeline',
						site_to_be_used_as_template: siteId,
					} );
					createSuccessNotice( __( 'Settings saved successfully.' ), { type: 'snackbar' } );

					setIsConfirmDialogOpen( false );
				},
			}
		);
	};

	const options = useMemo(
		() => [
			{
				id: 'new_comment',
				label: getFieldLabel( 'new_comment' ),
				value: timelineSettings?.new_comment ?? false,
			},
			{
				id: 'comment_like',
				label: getFieldLabel( 'comment_like' ),
				value: timelineSettings?.comment_like ?? false,
			},
			{
				id: 'post_like',
				label: getFieldLabel( 'post_like' ),
				value: timelineSettings?.post_like ?? false,
			},
			{
				id: 'recommended_blog',
				label: getFieldLabel( 'recommended_blog' ),
				value: timelineSettings?.recommended_blog ?? false,
			},
			{
				id: 'follow',
				label: getFieldLabel( 'follow' ),
				value: timelineSettings?.follow ?? false,
			},
			{
				id: 'achievement',
				label: getFieldLabel( 'achievement' ),
				value: timelineSettings?.achievement ?? false,
			},
			{
				id: 'mentions',
				label: getFieldLabel( 'mentions' ),
				value: timelineSettings?.mentions ?? false,
			},
			{
				id: 'scheduled_publicize',
				label: getFieldLabel( 'scheduled_publicize' ),
				value: timelineSettings?.scheduled_publicize ?? false,
			},
			{
				id: 'blogging_prompt',
				label: getFieldLabel( 'blogging_prompt' ),
				value: timelineSettings?.blogging_prompt ?? false,
			},
			{
				id: 'form_response',
				label: getFieldLabel( 'form_response' ),
				value: timelineSettings?.form_response ?? false,
			},
		],
		[ timelineSettings ]
	);

	if ( ! timelineSettings ) {
		return null;
	}

	return (
		<>
			<ApplySettingsToAllSitesConfirmationModal
				onCancel={ () => setIsConfirmDialogOpen( false ) }
				onConfirm={ handleApplyAll }
				isBusy={ isUpdating }
				isOpen={ isConfirmDialogOpen }
			/>
			<VStack spacing={ 4 } alignment="start">
				<SettingsPanel options={ options } onChange={ handleChange } disabled={ isUpdating } />
				<Button onClick={ askForConfirmation } isBusy={ isUpdating } variant="primary">
					{ __( 'Apply to all sites' ) }
				</Button>
			</VStack>
		</>
	);
};
