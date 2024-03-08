import { useEffect } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { requestSiteChecklist } from 'calypso/state/checklist/actions';
import { Checklist } from 'calypso/state/checklist/types';
import getSiteChecklist from 'calypso/state/selectors/get-site-checklist';

const useSiteChecklist = ( siteId: string ): Checklist | null => {
	const dispatch = useDispatch();
	const siteChecklist = useSelector( ( state ) => getSiteChecklist( state, Number( siteId ) ) );

	useEffect( () => {
		if ( siteId && ! siteChecklist ) {
			dispatch( requestSiteChecklist( siteId ) );
		}
	}, [ dispatch, siteId, siteChecklist ] );

	return siteChecklist;
};

export default useSiteChecklist;
