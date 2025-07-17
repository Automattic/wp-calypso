import { __experimentalText as Text, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { Callout } from '../../components/callout';
import illustrationUrl from './upsell-illustration.svg';
import type { CalloutProps } from '../../components/callout/types';
import type { Site } from '../../data/types';

export interface UpsellCalloutProps {
	upsellIcon?: CalloutProps[ 'icon' ];
	upsellImage?: CalloutProps[ 'image' ];
	upsellTitle?: CalloutProps[ 'title' ];
	upsellDescription?: CalloutProps[ 'description' ];
}

export default function UpsellCallout( {
	site,
	onClick,
	upsellIcon,
	upsellImage,
	upsellTitle,
	upsellDescription,
}: {
	site: Site;
	onClick: () => void;
} & UpsellCalloutProps ) {
	const handleUpsellClick = () => {
		onClick();

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
			icon={ upsellIcon ?? defaultProps.icon }
			image={ upsellImage ?? defaultProps.image }
			title={ upsellTitle ?? defaultProps.title }
			description={
				<>
					<Text variant="muted">{ upsellDescription ?? defaultProps.description }</Text>
					<Text variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<Button variant="primary" size="compact" onClick={ handleUpsellClick }>
					{ __( 'Upgrade plan' ) }
				</Button>
			}
		/>
	);
}
