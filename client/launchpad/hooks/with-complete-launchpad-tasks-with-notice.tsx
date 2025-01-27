import { useCompleteLaunchpadTasksWithNotice } from './use-complete-launchpad-tasks-with-notice';

export const withCompleteLaunchpadTasksWithNotice = < T extends object >(
	WrappedComponent: React.ComponentType< T >
) => {
	return function ( props: T ) {
		const completeLaunchpadTasks = useCompleteLaunchpadTasksWithNotice();

		return <WrappedComponent { ...props } completeLaunchpadTasks={ completeLaunchpadTasks } />;
	};
};
