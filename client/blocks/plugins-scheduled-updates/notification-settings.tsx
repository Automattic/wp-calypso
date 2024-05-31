import {
	__experimentalText as Text,
	CheckboxControl,
	Button,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useScheduledUpdatesNotificationSettingsMutation } from 'calypso/data/plugins/use-scheduled-updates-notification-settings-mutation';
import { useScheduledUpdatesNotificationSettingsQuery } from 'calypso/data/plugins/use-scheduled-updates-notification-settings-query';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { fetchSettings } from 'calypso/state/notification-settings/actions';
import { getNotificationSettings } from 'calypso/state/notification-settings/selectors';
import { useSiteSlug } from './hooks/use-site-slug';

import './notification-settings.scss';

type Props = {
	onNavBack?: () => void;
};

export const NotificationSettings = ( { onNavBack }: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { data: settings, isFetched } = useScheduledUpdatesNotificationSettingsQuery( siteSlug );
	const [ formValues, setFormValues ] = useState( {
		success: false,
		failure: false,
	} );
	useEffect( () => {
		dispatch( fetchSettings() );
	}, [ dispatch ] );

	const hasGlobalNotificationsDisabled = useSelector( ( state ) => {
		const settings = getNotificationSettings( state, 'wpcom' );
		return settings && ! settings.scheduled_updates;
	} );

	const {
		updateNotificationSettings,
		isPending: isSaving,
		isSuccess,
		isError,
	} = useScheduledUpdatesNotificationSettingsMutation( siteSlug );

	useEffect( () => {
		if ( isFetched && settings ) {
			setFormValues( {
				success: settings.success,
				failure: settings.failure,
			} );
		}
	}, [ isFetched, settings ] );

	useEffect( () => {
		if ( isSuccess ) {
			onNavBack?.();
			dispatch( successNotice( translate( 'Your notification settings have been saved.' ) ) );
		} else if ( isError ) {
			dispatch(
				errorNotice( translate( 'Failed to save notification settings. Please try again.' ) )
			);
		}
	}, [ isSuccess, isError, onNavBack ] );

	const handleCheckboxChange = ( field: keyof typeof formValues ) => ( checked: boolean ) => {
		setFormValues( ( prevValues ) => ( {
			...prevValues,
			[ field ]: checked,
		} ) );
	};

	const onSave = useCallback( () => {
		updateNotificationSettings( formValues );
	}, [ formValues, updateNotificationSettings ] );

	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				<div className="ch-placeholder">
					{ onNavBack && (
						<Button icon={ arrowLeft } onClick={ onNavBack }>
							{ translate( 'Back' ) }
						</Button>
					) }
				</div>
				<Text>{ translate( 'Notification Settings' ) }</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<CardBody className="notification-settings-form">
				<form>
					<label>{ translate( 'Email me' ) }</label>
					<Text className="info-msg">
						{ translate(
							'Receive email notifications to stay informed about the performance of the plugin updates.'
						) }
					</Text>

					<div className="form-field">
						<CheckboxControl
							label={ translate( 'On successful updates' ) }
							checked={ formValues.success }
							onChange={ handleCheckboxChange( 'success' ) }
							disabled={ ! isFetched || hasGlobalNotificationsDisabled }
						/>
					</div>
					<div className="form-field">
						<CheckboxControl
							label={ translate( 'On failed updates' ) }
							checked={ formValues.failure }
							onChange={ handleCheckboxChange( 'failure' ) }
							disabled={ ! isFetched || hasGlobalNotificationsDisabled }
						/>
					</div>

					{ hasGlobalNotificationsDisabled && (
						<Text className="info-msg">
							{ translate(
								"You've opted out of WordPress.com's scheduled update notifications. Head to {{notificationSettingsLink}}Notification Settings{{/notificationSettingsLink}} to re-enable them.",
								{
									components: {
										notificationSettingsLink: <a href="/me/notifications/updates" />,
									},
								}
							) }
						</Text>
					) }
				</form>
			</CardBody>
			<CardFooter>
				<Button variant="primary" disabled={ isSaving } onClick={ onSave }>
					{ translate( 'Save' ) }
				</Button>
			</CardFooter>
		</Card>
	);
};
