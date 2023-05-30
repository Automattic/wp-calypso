import { useLaunchpad } from '@automattic/data-stores';
import Checklist from './checklist';

export interface LaunchpadProps {
	siteSlug: string;
}

const Launchpad = ( { siteSlug }: LaunchpadProps ) => {
	const { isFetchedAfterMount, data } = useLaunchpad( siteSlug || '' );

	const tasks = data.checklist || [];

	return (
		<div className="launchpad__checklist-wrapper">
			{ isFetchedAfterMount ? <Checklist tasks={ tasks } /> : <Checklist.Placeholder /> }
		</div>
	);
};

export default Launchpad;
