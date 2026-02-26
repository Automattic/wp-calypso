import { __ } from '@wordpress/i18n';
import { lockOutline, published } from '@wordpress/icons';
import { launch } from '../../components/icons';
import OverviewCard from '../../components/overview-card';
import type { Site } from '@automattic/api-core';

const CARD_PROPS = {
	title: __( 'Visibility' ),
	tracksId: 'site-overview-visibility-ciab',
};

export default function VisibilityCardCiab( { site }: { site: Site } ) {
	if ( site.is_coming_soon ) {
		return (
			<OverviewCard
				{ ...CARD_PROPS }
				icon={ launch }
				heading={ __( 'Coming soon' ) }
				description={ __( 'Visitors will see a coming soon page.' ) }
			/>
		);
	}

	if ( site.is_private ) {
		return (
			<OverviewCard
				{ ...CARD_PROPS }
				icon={ lockOutline }
				heading={ __( 'Private' ) }
				description={ __( 'Only invited users can view your site.' ) }
			/>
		);
	}

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			icon={ published }
			heading={ __( 'Public' ) }
			description={ __( 'Anyone can view your site.' ) }
			intent="success"
		/>
	);
}
