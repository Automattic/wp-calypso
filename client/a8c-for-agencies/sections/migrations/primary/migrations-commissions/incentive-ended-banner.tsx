import { __experimentalText as Text } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';

export default function IncentiveEndedBanner() {
	const translate = useTranslate();

	return (
		<LayoutBanner
			isFullWidth
			level="info"
			title={ translate( 'Migration incentive program has ended' ) }
			hideCloseButton
		>
			<Text>
				{ translate(
					'The incentive for sites migrated through August 31, 2025 has ended. New migrations are no longer eligible for commissions.'
				) }
			</Text>
		</LayoutBanner>
	);
}
