import { __experimentalText as Text, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { Callout } from '../../components/callout';
import illustrationUrl from './upsell-illustration.svg';
import type { CalloutProps } from '../../components/callout/types';
import type { Site } from '../../data/types';

interface HostingFeatureUpsellProps {
	site: Site;
	tracksFeatureId: string;
	icon?: CalloutProps[ 'icon' ];
	image?: CalloutProps[ 'image' ];
	title?: CalloutProps[ 'title' ];
	description?: CalloutProps[ 'description' ];
}

export default function HostingFeatureUpsell( {
	site,
	tracksFeatureId,
	icon,
	image,
	title,
	description,
}: HostingFeatureUpsellProps ) {
	const { recordTracksEvent } = useAnalytics();
	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_hosting_feature_upsell_impression', {
			feature_id: tracksFeatureId,
		} );
	}, [ recordTracksEvent, tracksFeatureId ] );

	const handleUpgradePlan = () => {
		recordTracksEvent( 'calypso_dashboard_hosting_feature_upsell_click', {
			feature_id: tracksFeatureId,
		} );

		const backUrl = window.location.href.replace( window.location.origin, '' );

		window.location.href = addQueryArgs(
			`/checkout/${ encodeURIComponent( site.slug ) }/business`,
			{
				cancel_to: backUrl,
				redirect_to: backUrl,
			}
		);
	};

	const defaultProps = {
		icon: settings,
		image: illustrationUrl,
		title: __( 'Fine-tune your WordPress site' ),
		description: __(
			'Get under the hood—control caching, choose your PHP version, and test out upcoming WordPress releases.'
		),
	};

	return (
		<Callout
			icon={ icon ?? defaultProps.icon }
			image={ image ?? defaultProps.image }
			title={ title ?? defaultProps.title }
			description={
				<>
					<Text variant="muted">{ description ?? defaultProps.description }</Text>
					<Text variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<Button variant="primary" size="compact" onClick={ handleUpgradePlan }>
					{ __( 'Upgrade plan' ) }
				</Button>
			}
		/>
	);
}
