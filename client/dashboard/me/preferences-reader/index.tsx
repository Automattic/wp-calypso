import { isAutomatticianQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { postAuthor } from '@wordpress/icons';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function PreferencesReader( { density }: { density?: Density } ) {
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const { data: isSeenPostsEnabled } = useSuspenseQuery(
		userPreferenceQuery( 'reader-seen-posts' )
	);

	if ( ! isAutomattician ) {
		return null;
	}

	const badges = [
		{
			text: isSeenPostsEnabled ? __( 'Read status on' ) : __( 'Read status off' ),
			intent: isSeenPostsEnabled ? ( 'stable' as const ) : ( 'draft' as const ),
		},
	];

	return (
		<RouterLinkSummaryButton
			density={ density }
			to="/me/preferences/reader"
			title={ __( 'Reader' ) }
			description={ __( 'Manage how the Reader shows posts you have already read.' ) }
			decoration={ <Icon icon={ postAuthor } size={ 24 } /> }
			badges={ badges }
		/>
	);
}
