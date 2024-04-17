import {
	__experimentalText as Text,
	CheckboxControl,
	Card,
	CardHeader,
	Button,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useScheduledUpdatesNotificationSettingsMutation } from 'calypso/data/plugins/use-scheduled-updates-notification-settings-mutation';
import { useScheduledUpdatesNotificationSettingsQuery } from 'calypso/data/plugins/use-scheduled-updates-notification-settings-query';
import { useSiteSlug } from './hooks/use-site-slug';

import './notification-settings.scss';

type Props = {
	onNavBack?: () => void;
};

export const NotificationSettings = ( { onNavBack }: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { data: settings, isFetched } = useScheduledUpdatesNotificationSettingsQuery( siteSlug );
	const [ formValues, setFormValues ] = useState( {
		success: false,
		failure: false,
	} );

	const { updateNotificationSettings, isPending: isSaving } =
		useScheduledUpdatesNotificationSettingsMutation( siteSlug );

	useEffect( () => {
		if ( isFetched && settings ) {
			setFormValues( {
				success: settings.success,
				failure: settings.failure,
			} );
		}
	}, [ isFetched, settings ] );

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
				<Text>{ translate( 'Notification management' ) }</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<CardBody className="notification-settings-form">
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
						disabled={ ! isFetched }
					/>
				</div>
				<div className="form-field">
					<CheckboxControl
						label={ translate( 'On failed updates' ) }
						checked={ formValues.failure }
						onChange={ handleCheckboxChange( 'failure' ) }
						disabled={ ! isFetched }
					/>
				</div>
			</CardBody>
			<CardFooter>
				<Button variant="primary" disabled={ isSaving } onClick={ onSave }>
					{ translate( 'Save' ) }
				</Button>
			</CardFooter>
		</Card>
	);
};
