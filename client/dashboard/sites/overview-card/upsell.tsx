import { __ } from '@wordpress/i18n';
import { upsell } from '../../components/icons';
import OverviewCard from './index';
import type { OverviewCardProps } from './index';

type UpsellCardProps = Pick<
	OverviewCardProps,
	'heading' | 'description' | 'externalLink' | 'trackId'
>;

export default function UpsellCard( {
	heading,
	description,
	externalLink,
	trackId,
}: UpsellCardProps ) {
	return (
		<OverviewCard
			title={ __( 'Upgrade to unlock' ) }
			heading={ heading }
			icon={ upsell }
			description={ description }
			externalLink={ externalLink }
			trackId={ trackId }
			variant="upsell"
		/>
	);
}
