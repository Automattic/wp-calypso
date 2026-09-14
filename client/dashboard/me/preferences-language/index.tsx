import { userSettingsQuery } from '@automattic/api-queries';
import { getLanguage } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { language } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function PreferencesLanguage( { density }: { density?: Density } ) {
	const { data: userSettings } = useQuery( {
		...userSettingsQuery(),
		meta: { persist: false },
	} );

	const locale = userSettings?.locale_variant || userSettings?.language;
	const languageInfo = locale ? getLanguage( locale ) : undefined;
	const languageName = languageInfo?.name ?? __( 'English' );

	const badges = [
		{
			text: languageName,
		},
	];

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/language"
			title={ __( 'Language' ) }
			description={ __( 'Set the display language for WordPress.com.' ) }
			decoration={ <Icon icon={ language } size={ 24 } /> }
			badges={ badges }
		/>
	);
}
