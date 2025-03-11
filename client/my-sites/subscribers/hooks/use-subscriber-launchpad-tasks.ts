import { useLaunchpad } from '@automattic/data-stores';
import { Task } from '@automattic/launchpad';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const useSubscriberLaunchpadTasks = () => {
	const checklistSlug = 'subscribers';
	const site = useSelector( getSelectedSite );

	const {
		data: { checklist },
	} = useLaunchpad( site?.slug ?? null, checklistSlug );

	// We can alter the tasks here, keeping this in for future use
	const taskFilter = ( tasks: Task[] ): Task[] => {
		if ( ! tasks ) {
			return [];
		}
		return tasks;
	};

	const enhancedChecklist = checklist ? taskFilter( checklist ) : [];
	const numberOfSteps = enhancedChecklist.length;
	const completedSteps = enhancedChecklist.filter( ( task ) => task.completed ).length;

	return {
		checklistSlug,
		taskFilter,
		numberOfSteps,
		completedSteps,
	};
};

export default useSubscriberLaunchpadTasks;
