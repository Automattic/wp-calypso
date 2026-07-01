import { isAutomatticianQuery, rawUserPreferencesQuery } from '@automattic/api-queries';
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

function PreferencesAppearanceSummary( {
	density,
	isAutomattician,
}: {
	density?: Density;
	isAutomattician: boolean;
} ) {
	const { colorScheme } = useColorScheme();

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/appearance"
			title={ isAutomattician ? __( 'Appearance (a8c only)' ) : __( 'Appearance (Beta)' ) }
			description={ __( 'Choose how the dashboard looks.' ) }
			decoration={ <Icon icon={ styles } size={ 24 } /> }
			badges={ [ { text: getColorSchemeLabel( colorScheme ) } ] }
		/>
	);
}

export default function PreferencesAppearance( { density }: { density?: Density } ) {
	const config = useAppContext();
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const { data: preferences } = useSuspenseQuery( rawUserPreferencesQuery() );
	const hasUsedColorScheme = preferences[ 'hosting-dashboard-color-scheme' ] !== undefined;

	if ( ! config.supports.darkMode || ! config.supports.colorScheme || isDashboardBackport() ) {
		return null;
	}

	// "Used before" is inferred from the presence of the color scheme preference; Automatticians
	// always get access as an a8c-only preview.
	if ( ! isAutomattician && ! hasUsedColorScheme ) {
		return null;
	}

	return <PreferencesAppearanceSummary density={ density } isAutomattician={ isAutomattician } />;
}
