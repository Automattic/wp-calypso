import { siteWordPressVersionMutation, wpOrgCoreVersionQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { formatWordPressVersion } from '../../utils/wp-version';
import type { Site } from '@automattic/api-core';

interface BetaOptOutButtonProps {
	site: Site;
}

export function BetaOptOutButton( { site }: BetaOptOutButtonProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: latestVersion } = useQuery( wpOrgCoreVersionQuery() );
	const { data: betaVersion } = useQuery( wpOrgCoreVersionQuery( 'beta' ) );

	const mutation = useMutation( {
		...siteWordPressVersionMutation( site.ID, { deferUntilBackupComplete: false } ),
		meta: {
			snackbar: {
				success: __( 'You have opted out of the WordPress beta version.' ),
				error: __( 'Failed to opt out of the WordPress beta version.' ),
			},
		},
	} );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_wp_beta_opt_out_click', {
			site_id: site.ID,
			from_version: betaVersion ?? '',
			to_version: latestVersion ?? '',
		} );
		mutation.mutate( 'latest' );
	};

	const latestLabel = formatWordPressVersion( latestVersion ?? '', 'latest', true );

	return (
		<Button
			variant="primary"
			onClick={ handleClick }
			isBusy={ mutation.isPending }
			disabled={ mutation.isPending }
		>
			{ latestLabel
				? sprintf(
						/* translators: %s is the WordPress version, e.g. "6.8 (Latest)" */
						__( 'Switch to WordPress %s' ),
						latestLabel
				  )
				: __( 'Opt out of the WordPress beta version' ) }
		</Button>
	);
}
