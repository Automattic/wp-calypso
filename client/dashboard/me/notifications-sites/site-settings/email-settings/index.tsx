import { userNotificationsSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { SettingsOption, SettingsPanel } from '../../../../../components/settings-panel';
import { useAnalytics } from '../../../../app/analytics';
import { getFieldLabel } from '../../helpers/translations';
import { useSiteSettings } from '../../hooks';
import { ApplySettingsToAllSitesConfirmationModal } from '../apply-settings-to-all-sites-confirmation-modal';

export const EmailSettings = ( { siteId }: { siteId: number } ) => {
	const { data: blogSettings } = useSiteSettings( siteId );
	const { mutate: updateSettings, isPending: isUpdating } = useMutation(
		userNotificationsSettingsMutation()
	);
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const emailSettings = blogSettings?.email ?? null;
	const settings = emailSettings ?? null;

	const handleChange = ( updated: SettingsOption ) => {
		updateSettings(
			{
				data: {
					blogs: [ { blog_id: siteId, email: { ...settings, [ updated.id ]: updated.value } } ],
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

					recordTracksEvent( 'calypso_dashboard_notifications_email_settings_updated', {
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
						stream: 'email',
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
				value: settings?.new_comment ?? false,
			},
			{
				id: 'comment_like',
				label: getFieldLabel( 'comment_like' ),
				value: settings?.comment_like ?? false,
			},
			{
				id: 'post_like',
				label: getFieldLabel( 'post_like' ),
				value: settings?.post_like ?? false,
			},
			{
				id: 'recommended_blog',
				label: getFieldLabel( 'recommended_blog' ),
				value: settings?.recommended_blog ?? false,
			},
			{
				id: 'follow',
				label: getFieldLabel( 'follow' ),
				value: settings?.follow ?? false,
			},
			{
				id: 'mentions',
				label: getFieldLabel( 'mentions' ),
				value: settings?.mentions ?? false,
			},
			{
				id: 'blogging_prompt',
				label: getFieldLabel( 'blogging_prompt' ),
				value: settings?.blogging_prompt ?? false,
			},
			{
				id: 'draft_post_prompt',
				label: getFieldLabel( 'draft_post_prompt' ),
				value: settings?.draft_post_prompt ?? false,
			},
		],
		[ settings ]
	);

	if ( ! settings ) {
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
				<SettingsPanel disabled={ isUpdating } options={ options } onChange={ handleChange } />
				<Button onClick={ askForConfirmation } variant="primary" isBusy={ isUpdating }>
					{ __( 'Apply to all sites' ) }
				</Button>
			</VStack>
		</>
	);
};
