import { useEffect } from 'react';
import { useCompleteLaunchpadTasksWithNotice } from './use-complete-launchpad-tasks-with-notice';

interface TaskCompleteNoticeOptions {
	taskSlug: string;
	enabled: boolean;
	noticeId: string;
	noticeText: string;
	noticeDuration?: number;
}

export const useCompleteLaunchpadTaskWithNoticeOnLoad = ( {
	taskSlug,
	enabled,
	noticeId,
	noticeText,
	noticeDuration,
}: TaskCompleteNoticeOptions ) => {
	const completeTasks = useCompleteLaunchpadTasksWithNotice( { notifyIfNothingChanged: false } );

	useEffect( () => {
		if ( enabled ) {
			completeTasks( [ taskSlug ], noticeText, {
				id: noticeId,
				duration: noticeDuration,
			} );
		}
	}, [ completeTasks, enabled, taskSlug, noticeId, noticeText, noticeDuration ] );
};
