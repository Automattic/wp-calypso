import page from '@automattic/calypso-router';
import { sortLaunchpadTasksByCompletionStatus, useLaunchpad } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

interface ShowNextStepsNotice {
	isCompleted: boolean;
	onTaskCompleted: ( successMessage: string ) => void;
}

export const useShowNextStepsNotice = ( taskId: string ): ShowNextStepsNotice => {
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const {
		data: { checklist },
	} = useLaunchpad( siteSlug, null, {
		onSuccess: sortLaunchpadTasksByCompletionStatus,
	} );
	const dispatch = useDispatch();
	const isCompleted = checklist?.find( ( task ) => task.id === taskId )?.completed ?? false;

	const onTaskCompleted = useCallback(
		( successMessage: string ) => {
			dispatch(
				successNotice( successMessage, {
					id: 'launchpad-task-complete',
					duration: 10000,
					button: 'Next steps',
					onClick: () => {
						page( `/home/${ siteSlug }` );
					},
				} )
			);
		},
		[ siteSlug, dispatch ]
	);

	return {
		isCompleted,
		onTaskCompleted,
	};
};
