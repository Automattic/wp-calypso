import { updateLaunchpadSettings } from '@automattic/data-stores';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export const useCompleteImportSubscribersTask = () => {
	const queryClient = useQueryClient();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const completeTask = async () => {
		if ( selectedSiteSlug ) {
			await updateLaunchpadSettings( selectedSiteSlug, {
				checklist_statuses: { import_subscribers: true },
			} );
		}

		queryClient.invalidateQueries( { queryKey: [ 'launchpad' ] } );
	};

	return completeTask;
};
