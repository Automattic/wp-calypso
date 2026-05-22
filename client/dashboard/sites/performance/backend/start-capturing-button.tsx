import { type Site } from '@automattic/api-core';
import { siteApmEnabledMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';

export default function StartCapturingButton( {
	site,
	variant = 'primary',
	context = 'header',
}: {
	site: Site;
	variant?: 'primary' | 'secondary';
	context?: 'header' | 'empty_state';
} ) {
	const { recordTracksEvent } = useAnalytics();

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_site_apm_enable_impression', { context } );
	}, [ recordTracksEvent, context ] );

	const { mutate, isPending } = useMutation( {
		...siteApmEnabledMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'APM enabled.' ),
				error: __( 'Failed to enable APM.' ),
			},
		},
	} );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_site_apm_enable_click', { context } );
		mutate( true );
	};

	return (
		<Button variant={ variant } isBusy={ isPending } disabled={ isPending } onClick={ handleClick }>
			{ __( 'Start capturing' ) }
		</Button>
	);
}
