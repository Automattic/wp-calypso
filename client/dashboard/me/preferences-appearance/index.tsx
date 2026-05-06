import { userPreferenceQuery } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { styles } from '@wordpress/icons';
import { useColorScheme, type ColorScheme } from '../../app/color-scheme';
import { useAppContext } from '../../app/context';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { AppConfig } from '../../app/context';
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

function PreferencesAppearanceSummary( {
	density,
	config,
}: {
	density?: Density;
	config: AppConfig;
} ) {
	const {
		data: optIn,
		isLoading,
		isError,
	} = useQuery( userPreferenceQuery( 'hosting-dashboard-opt-in' ) );
	const { colorScheme } = useColorScheme();

	if ( isLoading || isError ) {
		return null;
	}

	const isDashboardEnrolled =
		config.optIn &&
		( optIn?.value === 'opt-in' ||
			optIn?.value === 'forced-opt-in' ||
			isEnabled( 'dashboard/forced-opt-in' ) );

	if ( ! isDashboardEnrolled ) {
		return null;
	}

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/appearance"
			title={ __( 'Appearance (Experimental)' ) }
			description={ __( 'Choose how the dashboard looks.' ) }
			decoration={ <Icon icon={ styles } size={ 24 } /> }
			badges={ [ { text: getColorSchemeLabel( colorScheme ) } ] }
		/>
	);
}

export default function PreferencesAppearance( { density }: { density?: Density } ) {
	const config = useAppContext();

	if ( ! config.supports.colorScheme ) {
		return null;
	}

	return <PreferencesAppearanceSummary density={ density } config={ config } />;
}
