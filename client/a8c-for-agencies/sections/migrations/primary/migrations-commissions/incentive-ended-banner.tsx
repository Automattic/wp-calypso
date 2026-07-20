import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';

export default function IncentiveEndedBanner() {
	return (
		<LayoutBanner
			isFullWidth
			level="info"
			title={ __( 'Migration incentive program has ended' ) }
			hideCloseButton
		>
			<Text>
				{ __(
					'The incentive for sites migrated through August 31, 2025 has ended. New migrations are no longer eligible for commissions.'
				) }
			</Text>
		</LayoutBanner>
	);
}
