import { __experimentalText as Text, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { Callout } from '../../components/callout';
import calloutIllustrationUrl from './callout-illustration.svg';
import type { CalloutProps } from '../../components/callout/types';
import type { ReactNode } from 'react';

interface SettingsCalloutProps extends Omit< CalloutProps, 'title' | 'description' > {
	siteSlug: string;
	title?: string;
	description?: ReactNode;
}

export default function SettingsCallout( {
	siteSlug,
	icon,
	imageSrc,
	title,
	description,
}: SettingsCalloutProps ) {
	const handleUpgradePlan = () => {
		const backUrl = window.location.href.replace( window.location.origin, '' );

		window.location.href = addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }/business`, {
			cancel_to: backUrl,
			redirect_to: backUrl,
		} );
	};

	const defaultProps = {
		icon: settings,
		imageSrc: calloutIllustrationUrl,
		title: __( 'Fine-tune your WordPress site' ),
		description: __(
			'Get under the hood—control caching, choose your PHP version, and test out upcoming WordPress releases.'
		),
	};

	return (
		<Callout
			icon={ icon ?? defaultProps.icon }
			imageSrc={ imageSrc ?? defaultProps.imageSrc }
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
