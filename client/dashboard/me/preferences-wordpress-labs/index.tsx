import { userPreferenceQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpressLabs } from '../../components/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function PreferencesWordPressLabs( { density }: { density?: Density } ) {
	const { data: optIn } = useSuspenseQuery( userPreferenceQuery( 'wordpress-labs-opt-in' ) );
	const isOptedIn = optIn.value === 'opt-in';

	const badges = [
		{
			text: isOptedIn ? __( 'Enabled' ) : __( 'Disabled' ),
			intent: isOptedIn ? ( 'stable' as const ) : ( 'draft' as const ),
		},
	];

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/wordpress-labs"
			title={ __( 'Early access' ) }
			description={ __( 'Opt in for early access to new features and experiments.' ) }
			decoration={ <Icon icon={ wordpressLabs } size={ 24 } /> }
			badges={ badges }
		/>
	);
}
