import { userSettingsQuery } from '@automattic/api-queries';
import { getLanguage } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { language } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { SummaryButtonBadgeProps } from '@automattic/components/src/summary-button/types';

export default function PreferencesLanguageSummary() {
	const { data: userSettings } = useQuery( {
		...userSettingsQuery(),
		meta: { persist: false },
	} );

	const locale = userSettings?.locale_variant || userSettings?.language;
	const languageInfo = locale ? getLanguage( locale ) : undefined;
	const languageName = languageInfo?.name ?? __( 'English' );

	const badges: SummaryButtonBadgeProps[] = [
		{
			text: languageName,
			intent: 'default',
		},
	];

	return (
		<RouterLinkSummaryButton
			to="/me/preferences/language"
			title={ __( 'Language' ) }
			description={ __( 'Set the display language for WordPress.com.' ) }
			decoration={ <Icon icon={ language } /> }
			badges={ badges }
		/>
	);
}
