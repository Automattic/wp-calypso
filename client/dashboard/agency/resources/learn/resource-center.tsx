import { __experimentalSpacer as Spacer, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import BrowseResources from './browse-resources';
import type { ResourceItem, RecordTracksEvent } from './types';
import type { AgencyResourcesResponse } from '@automattic/api-core';

interface ResourceCenterProps {
	data: AgencyResourcesResponse | undefined;
	recordTracksEvent?: RecordTracksEvent;
	onResourceClick?: ( resource: ResourceItem ) => void;
}

// Props are accepted so the dashboard and a8c host wrappers keep passing them
// unchanged; the prototype browse below is self-contained and uses none of them.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ResourceCenter( _props: ResourceCenterProps ) {
	return (
		<>
			<Spacer marginBottom={ 8 } style={ { maxWidth: '650px' } }>
				<Text size={ 15 }>
					{ __(
						'Browse our guides and articles for agencies, with exclusive materials designed to help you grow and run your agency more effectively. You will find practical guidance, playbooks, and training, including practical ways to recommend the right solutions for your clients.'
					) }
				</Text>
			</Spacer>

			<BrowseResources />
		</>
	);
}
