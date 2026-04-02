import { userSettingsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { seen } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';

export default function PreferencesPrivacy() {
	const { data: userSettings } = useQuery( userSettingsQuery() );
	const isSharingUsageInfo = userSettings ? ! userSettings.tracks_opt_out : undefined;

	const badges =
		isSharingUsageInfo !== undefined
			? [
					{
						text: isSharingUsageInfo
							? __( 'Sharing usage information' )
							: __( 'Not sharing usage information' ),
						intent: isSharingUsageInfo ? ( 'success' as const ) : undefined,
					},
			  ]
			: undefined;

	return (
		<RouterLinkSummaryButton
			to="/me/preferences/privacy"
			title={ __( 'Privacy' ) }
			description={ __( 'Manage your privacy settings and data sharing preferences.' ) }
			decoration={ <Icon icon={ seen } size={ 24 } /> }
			badges={ badges }
		/>
	);
}
