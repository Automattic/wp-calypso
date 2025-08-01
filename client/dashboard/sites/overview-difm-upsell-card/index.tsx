import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Callout } from '../../components/callout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import illustrationUrl from './upsell-illustration.svg';
import type { Site } from '../../data/types';

const FOUR_DAYS_IN_MILLISECONDS = 4 * 24 * 60 * 60 * 1000;

export default function DIFMUpsellCard( { site }: { site: Site } ) {
	if ( site.launch_status !== 'unlaunched' ) {
		return null;
	}

	if ( ! site.options?.created_at ) {
		return null;
	}

	const siteCreatedAt = Date.parse( site.options.created_at );
	if ( Date.now() - siteCreatedAt < FOUR_DAYS_IN_MILLISECONDS ) {
		return null;
	}

	return (
		<Callout
			title={ __( 'We’ll bring your vision to life' ) }
			titleAs="h2"
			description={
				<Text variant="muted">
					{ __(
						'Leave the heavy lifting to us and let our professional builders craft your website.'
					) }
				</Text>
			}
			image={ illustrationUrl }
			imageAlt={ __( 'Responsive website design' ) }
			imageVariant="full-bleed"
			actions={
				<UpsellCTAButton
					href="/start/do-it-for-me/new-or-existing-site?ref=site-overview"
					target="_blank"
					text={ __( 'Build it for me' ) }
					variant="secondary"
					tracksId="difm"
				/>
			}
		/>
	);
}
