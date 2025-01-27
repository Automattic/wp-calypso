import page from '@automattic/calypso-router';
import { useLaunchpad, updateLaunchpadSettings } from '@automattic/data-stores';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { NoticeOptions } from 'calypso/state/notices/types';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export const useCompleteLaunchpadTasksWithNotice = ( { notifyIfNothingChanged = true } = {} ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );

	const dispatch = useDispatch();
	const { __ } = useI18n();

	const { data, refetch } = useLaunchpad( siteSlug );

	const incompleteTasks = useMemo( () => {
		return data?.checklist?.filter( ( task ) => ! task.completed ).map( ( task ) => task.id ) ?? [];
	}, [ data ] );

	const completeTasks = useCallback(
		async ( taskSlugs: string[], noticeText: string, noticeSettings: NoticeOptions ) => {
			const tasksToComplete = incompleteTasks?.filter( ( taskSlug ) =>
				taskSlugs.includes( taskSlug )
			);

			if ( tasksToComplete.length === 0 ) {
				if ( notifyIfNothingChanged ) {
					dispatch( successNotice( noticeText, noticeSettings ) );
				}

				return;
			}

			dispatch(
				successNotice( noticeText, {
					...noticeSettings,
					button: __( 'Next steps' ),
					onClick: () => page( `/home/${ siteSlug }` ),
				} )
			);

			await updateLaunchpadSettings( siteSlug, {
				checklist_statuses: tasksToComplete.reduce(
					( acc, taskSlug ) => {
						acc[ taskSlug ] = true;
						return acc;
					},
					{} as Record< string, boolean >
				),
			} );

			refetch();
		},
		[ incompleteTasks, siteSlug, __, refetch, dispatch, notifyIfNothingChanged ]
	);

	return completeTasks;
};
