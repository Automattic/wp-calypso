import { SiteDetails } from '@automattic/data-stores/src/site';
import { LaunchPadCheckListTasksStatuses } from '@automattic/launch/src/stores';
import { useState, useEffect } from '@wordpress/element';
import { useCallback } from 'react';
import request from 'wpcom-proxy-request';

const useLaunchPadCheckListTasksStatuses = ( siteIdOrSlug: string | number ) => {
	const [ siteLaunchpadStatuses, setSiteLaunchpadStatuses ] = useState(
		{} as LaunchPadCheckListTasksStatuses
	);

	const fetchSite = useCallback( async () => {
		const siteObj: SiteDetails = await request( {
			path: `/sites/${ siteIdOrSlug }?http_envelope=1`,
			apiVersion: '1.1',
		} );

		if ( siteObj?.options?.launchpad_checklist_tasks_statuses ) {
			setSiteLaunchpadStatuses(
				siteObj?.options?.launchpad_checklist_tasks_statuses as LaunchPadCheckListTasksStatuses
			);
		}
	}, [ siteIdOrSlug ] );

	useEffect( () => {
		fetchSite();
	}, [ fetchSite ] );

	return siteLaunchpadStatuses;
};
export default useLaunchPadCheckListTasksStatuses;
