import {
	TemporaryDismiss,
	useLaunchpadDismisser,
	useSortedLaunchpadTasks,
} from '@automattic/data-stores';
import { type Task } from '@automattic/launchpad';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

interface UseLaunchpadProps {
	checklistSlug: string;
	launchpadContext: string;
}

export function useMyHomeCardLaunchpad( { checklistSlug, launchpadContext }: UseLaunchpadProps ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state: AppState ) => getSiteSlug( state, siteId ) || '' );

	const { mutate: dismiss } = useLaunchpadDismisser( siteSlug, checklistSlug, launchpadContext );

	const {
		data: { checklist, is_dismissed: isDismissed, is_dismissible: isDismissible, title },
		refetch,
	} = useSortedLaunchpadTasks( siteSlug, checklistSlug, launchpadContext );

	const numberOfSteps = checklist?.length || 0;
	const completedSteps = ( checklist?.filter( ( task: Task ) => task.completed ) || [] ).length;
	const hasChecklist = checklist !== undefined && checklist !== null;
	const launchpadTitle = hasChecklist ? title ?? translate( 'Next steps for your site' ) : ' ';

	const temporaryDismiss = ( { dismissBy }: Pick< TemporaryDismiss, 'dismissBy' > ) => {
		dismiss( {
			dismissBy,
		} );
	};

	const permanentDismiss = () => dismiss( { isDismissed: true } );

	return {
		siteSlug,
		isDismissed,
		isDismissible,
		numberOfSteps,
		completedSteps,
		hasChecklist,
		launchpadTitle,
		temporaryDismiss,
		permanentDismiss,
		refetch,
	};
}
