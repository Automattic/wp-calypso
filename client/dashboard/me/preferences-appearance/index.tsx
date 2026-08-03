import { rawUserPreferencesQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { styles } from '@wordpress/icons';
import { useColorScheme, type ColorScheme } from 'calypso/lib/color-scheme';
import { useAppContext } from '../../app/context';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import type { Density } from '@automattic/components/src/summary-button/types';

function getColorSchemeLabel( colorScheme: ColorScheme ) {
	switch ( colorScheme ) {
		case 'dark':
			return __( 'Dark' );
		case 'system':
			return __( 'Auto' );
		default:
			return __( 'Light' );
	}
}

function PreferencesAppearanceSummary( { density }: { density?: Density } ) {
	const { colorScheme } = useColorScheme();

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/appearance"
			title={ __( 'Appearance (Beta)' ) }
			description={ __( 'Choose how the dashboard looks.' ) }
			decoration={ <Icon icon={ styles } size={ 24 } /> }
			badges={ [ { text: getColorSchemeLabel( colorScheme ) } ] }
		/>
	);
}

export default function PreferencesAppearance( { density }: { density?: Density } ) {
	const config = useAppContext();
	const isDarkModeRollout = isEnabled( 'dashboard/dark-mode-rollout' );
	const { data: preferences } = useSuspenseQuery( rawUserPreferencesQuery() );
	const hasUsedColorScheme = preferences[ 'hosting-dashboard-color-scheme' ] !== undefined;

	if ( ! config.supports.darkMode || ! config.supports.colorScheme || isDashboardBackport() ) {
		return null;
	}

	// "Used before" is inferred from the presence of the color scheme preference. The rollout
	// flag (off in production) keeps the setting available to everyone in non-production envs.
	if ( ! isDarkModeRollout && ! hasUsedColorScheme ) {
		return null;
	}

	return <PreferencesAppearanceSummary density={ density } />;
}
