import { __experimentalSpacer as Spacer, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function PartnerOffersOverviewContent() {
	return (
		<>
			<Spacer marginBottom={ 4 } style={ { maxWidth: '600px' } }>
				<Text size={ 15 }>
					{ __(
						'Discover exclusive offers, events, training, and tools from Automattic and our partners. Everything you need to help your agency grow and support your clients.'
					) }
				</Text>
			</Spacer>
		</>
	);
}
