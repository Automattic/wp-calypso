import page from '@automattic/calypso-router';
import { updateLaunchpadSettings, useLaunchpad } from '@automattic/data-stores';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

interface TaskCompleteNoticeOptions {
	taskSlug: string;
	enabled: boolean;
	noticeId: string;
	noticeText: string;
	noticeDuration?: number;
}

export const useTaskCompletedNotice = ( {
	taskSlug,
	noticeId,
	noticeText,
	noticeDuration,
	enabled,
}: TaskCompleteNoticeOptions ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );

	const dispatch = useDispatch();
	const { __ } = useI18n();

	const { data, refetch } = useLaunchpad( siteSlug );

	const isTaskCompleted = data?.checklist?.find( ( task ) => task.id === taskSlug )?.completed;

	const completeTask = useCallback( async () => {
		await updateLaunchpadSettings( siteSlug, {
			checklist_statuses: { [ taskSlug ]: true },
		} );

		const notice = successNotice( noticeText, {
			id: noticeId,
			duration: noticeDuration,
			button: __( 'Next steps' ),
			onClick: () => page( `/home/${ siteSlug }` ),
		} );

		dispatch( notice );

		refetch();
	}, [ noticeText, noticeId, noticeDuration, __, siteSlug, taskSlug, refetch, dispatch ] );

	useEffect( () => {
		if ( enabled && isTaskCompleted === false ) {
			completeTask();
		}
	}, [ completeTask, enabled, isTaskCompleted ] );
};
