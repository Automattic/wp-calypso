import { JetpackFeaturePreview } from 'calypso/a8c-for-agencies/sections/sites/features/jetpack/jetpack-feature';
import { Site } from 'calypso/a8c-for-agencies/sections/sites/types';
import ActivityLogV2 from 'calypso/my-sites/activity/activity-log-v2';

import 'calypso/my-sites/activity/activity-log-v2/style.scss';
import './style.scss';

type Props = {
	site: Site;
};

export function JetpackActivityPreview( { site }: Props ) {
	return (
		<JetpackFeaturePreview site={ site }>
			<ActivityLogV2 />
		</JetpackFeaturePreview>
	);
}
