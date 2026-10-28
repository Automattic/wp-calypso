import {
	queryClient,
	siteBySlugQuery,
	sitePendingWordPressVersionQuery,
	siteWordPressTrackVersionsQuery,
	siteWordPressVersionMutation,
	siteWordPressVersionQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import type { Site } from '@automattic/api-core';

interface BetaOptOutButtonProps {
	site: Site;
	onSuccess?: () => void;
	children?: React.ReactNode;
}

export function BetaOptOutButton( { site, onSuccess, children }: BetaOptOutButtonProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: trackVersions } = useQuery( siteWordPressTrackVersionsQuery( site.ID ) );

	const mutation = useMutation( {
		...withSnackbar( siteWordPressVersionMutation( site.ID, { deferUntilBackupComplete: false } ), {
			success: __( 'You have opted out of the WordPress beta version.' ),
			error: __( 'Failed to opt out of the WordPress beta version.' ),
		} ),
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
			from_version: trackVersions?.beta ?? '',
			to_version: trackVersions?.latest ?? '',
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
			{ children ?? __( 'Opt out of the WordPress beta version' ) }
		</Button>
	);
}
