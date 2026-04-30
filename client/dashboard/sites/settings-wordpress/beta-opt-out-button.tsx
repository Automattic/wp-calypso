import {
	queryClient,
	siteBySlugQuery,
	sitePendingWordPressVersionQuery,
	siteWordPressVersionMutation,
	siteWordPressVersionQuery,
	wpOrgCoreVersionQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import type { Site } from '@automattic/api-core';

interface BetaOptOutButtonProps {
	site: Site;
	onSuccess?: () => void;
}

export function BetaOptOutButton( { site, onSuccess }: BetaOptOutButtonProps ) {
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
		onSuccess: () => {
			queryClient.invalidateQueries( siteWordPressVersionQuery( site.ID ) );
			queryClient.invalidateQueries( sitePendingWordPressVersionQuery( site.ID ) );
			// Also refresh the site so the displayed software_version reflects the rollback.
			queryClient.invalidateQueries( siteBySlugQuery( site.slug ) );
			onSuccess?.();
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

	return (
		<Button
			variant="primary"
			onClick={ handleClick }
			isBusy={ mutation.isPending }
			disabled={ mutation.isPending }
		>
			{ __( 'Opt out of the WordPress beta version' ) }
		</Button>
	);
}
