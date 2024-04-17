import {
	__experimentalText as Text,
	PanelRow,
	PanelBody,
	CheckboxControl,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useScheduledUpdatesNotificationSettingsMutation } from 'calypso/data/plugins/use-scheduled-updates-notification-settings-mutation';
import { useScheduledUpdatesNotificationSettingsQuery } from 'calypso/data/plugins/use-scheduled-updates-notification-settings-query';
import { useSiteSlug } from './hooks/use-site-slug';

export const NotificationSettings = () => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const { data: settings, isFetched } = useScheduledUpdatesNotificationSettingsQuery( siteSlug );
	const { updateNotificationSettings } =
		useScheduledUpdatesNotificationSettingsMutation( siteSlug );

	return isFetched ? (
		<PanelBody>
			<PanelRow>
				<Text className="notification-settings__title">{ translate( 'Email me' ) }</Text>
			</PanelRow>
			<PanelRow>
				<CheckboxControl
					label={ translate( 'On successful updates' ) }
					checked={ settings?.success }
					onChange={ ( checked ) =>
						updateNotificationSettings( { success: checked, failure: settings?.failure ?? false } )
					}
				/>
			</PanelRow>

			<PanelRow>
				<CheckboxControl
					label={ translate( 'On failed updates' ) }
					checked={ settings?.failure }
					onChange={ ( checked ) =>
						updateNotificationSettings( { success: settings?.success ?? false, failure: checked } )
					}
				/>
			</PanelRow>
		</PanelBody>
	) : null;
};
