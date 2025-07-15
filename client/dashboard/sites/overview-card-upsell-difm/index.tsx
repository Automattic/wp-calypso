import { __ } from '@wordpress/i18n';
import UpsellWithActionCard from '../overview-card/upsell-with-action';
import illustrationUrl from './upsell-illustration.svg';
import type { Site } from '../../data/types';

const FOUR_DAYS_IN_MILLISECONDS = 4 * 24 * 60 * 60 * 1000;

export default function OverviewCardUpsellDIFM( { site }: { site: Site } ) {
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
		<UpsellWithActionCard
			action={ {
				href: '/start/do-it-for-me/new-or-existing-site?ref=site-overview',
				text: __( 'Build it for me' ),
				variant: 'secondary',
			} }
			description={ __(
				'Leave the heavy lifting to us and let our professional builders craft your website.'
			) }
			image={ illustrationUrl }
			imageAlt={ __( 'Responsive website design' ) }
			title={ __( 'We’ll bring your vision to life' ) }
			trackId="upsell-difm"
		/>
	);
}
