import { isSeenPostsAvailable, readTeamsQuery, userPreferenceQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import ReaderIcon from 'calypso/assets/icons/reader/reader-icon';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function PreferencesReader( { density }: { density?: Density } ) {
	// Non-suspense so a slow/failing /read/teams request never blocks the
	// preferences index; the rollout-gated section simply stays hidden until
	// (and unless) teams resolve as available.
	const { data: teamsData } = useQuery( readTeamsQuery() );
	const { data: isSeenPostsEnabled } = useSuspenseQuery(
		userPreferenceQuery( 'reader-seen-posts' )
	);

	if ( ! isSeenPostsAvailable( teamsData?.teams ) ) {
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
			decoration={ <ReaderIcon width={ 24 } height={ 24 } /> }
			badges={ badges }
		/>
	);
}
