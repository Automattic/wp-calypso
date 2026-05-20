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
			title={ __( 'Appearance (Experimental)' ) }
			description={ __( 'Choose how the dashboard looks.' ) }
			decoration={ <Icon icon={ styles } size={ 24 } /> }
			badges={ [ { text: getColorSchemeLabel( colorScheme ) } ] }
		/>
	);
}

export default function PreferencesAppearance( { density }: { density?: Density } ) {
	const config = useAppContext();

	if ( ! config.supports.darkMode || ! config.supports.colorScheme || isDashboardBackport() ) {
		return null;
	}

	return <PreferencesAppearanceSummary density={ density } />;
}
