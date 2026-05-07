import { siteApmEnabledMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalText as Text, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Callout } from '../../../components/callout';
import EmptyState from '../../../components/empty-state';
import illustrationUrl from '../performance-callout-illustration.svg';
import type { Site } from '@automattic/api-core';

export default function EnableApmCallout( { site }: { site: Site } ) {
	const { recordTracksEvent } = useAnalytics();
	const isDesktop = useViewportMatch( 'medium' );

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_site_apm_enable_impression' );
	}, [ recordTracksEvent ] );

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
		recordTracksEvent( 'calypso_dashboard_site_apm_enable_click' );
		mutate( true );
	};

	const callout = (
		<Callout
			icon={ chartBar }
			image={ illustrationUrl }
			imageAlt=""
			title={ __( 'Optimize your backend performance' ) }
			description={
				<Text variant="muted">
					{ __(
						'Get request-level tracing, top slow endpoints, and plugin bottleneck detection for your site.'
					) }
				</Text>
			}
			actions={
				<Button
					variant="primary"
					isBusy={ isPending }
					disabled={ isPending }
					onClick={ handleClick }
				>
					{ __( 'Enable' ) }
				</Button>
			}
		/>
	);

	if ( ! isDesktop ) {
		return callout;
	}

	return (
		<EmptyState.Wrapper>
			<div style={ { maxWidth: '600px' } }>{ callout }</div>
		</EmptyState.Wrapper>
	);
}
