import { __experimentalSpacer as Spacer, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ArtOfTheDeal from './art-of-the-deal';
import BrowseAllResources from './browse-all-resources';
import TopResources from './top-resources';

import './style.scss';

export default function ResourceCenterOverviewContent() {
	return (
		<>
			<Spacer marginBottom={ 8 } style={ { maxWidth: '650px' } }>
				<Text size={ 15 }>
					{ __(
						"Explore our resource center for agencies, where you'll find exclusive materials designed to help you sell and integrate Automattic products effectively. These tools not only enhance your sales strategies but also support you in running your agency smoothly and maximizing conversions."
					) }
				</Text>
			</Spacer>

			<TopResources />

			<ArtOfTheDeal />

			<BrowseAllResources />
		</>
	);
}
