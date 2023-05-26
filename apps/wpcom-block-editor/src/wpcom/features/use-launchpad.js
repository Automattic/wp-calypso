import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect, useCallback } from '@wordpress/element';

const useLaunchpadTasksCompleted = () => {
	const [ launchpadTasksCompleted, setLaunchpadTasksCompleted ] = useState( undefined );
	const [ launchpadSiteIntent, setLaunchpadIntent ] = useState( undefined );
	const [ launchpadFetched, setLaunchpadFetched ] = useState( false );

	const fetchLaunchpad = useCallback( () => {
		apiFetch( { path: '/wpcom/v2/launchpad' } )
			.then( ( result ) => {
				const checklist = result.checklist;
				if ( checklist ) {
					const lastTask = checklist[ checklist.length - 1 ];
					if ( lastTask.completed ) {
						setLaunchpadTasksCompleted( true );
						setLaunchpadIntent( result.site_intent );
						setLaunchpadFetched( true );
					}
				}
			} )
			.catch( () => {
				setLaunchpadTasksCompleted( undefined );
				setLaunchpadIntent( undefined );
				setLaunchpadFetched( false );
			} );
	}, [] );

	useEffect( () => {
		fetchLaunchpad();
	}, [ fetchLaunchpad ] );
	return { launchpadTasksCompleted, launchpadFetched, launchpadSiteIntent };
};
export default useLaunchpadTasksCompleted;
