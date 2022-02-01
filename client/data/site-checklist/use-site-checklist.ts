import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestSiteChecklist } from 'calypso/state/checklist/actions';
import { Checklist } from 'calypso/state/checklist/types';
import getSiteChecklist from 'calypso/state/selectors/get-site-checklist';
import isSiteEligibleForLegacyFSE from 'calypso/state/selectors/is-site-eligible-for-legacy-fse';

const useSiteChecklist = ( siteId: string ): Checklist | null => {
	const dispatch = useDispatch();
	const { siteChecklist, isSiteEligibleForFSE } = useSelector( ( state ) => ( {
		siteChecklist: getSiteChecklist( state, Number( siteId ) ),
		isSiteEligibleForFSE: isSiteEligibleForLegacyFSE( state, Number( siteId ) ),
	} ) );

	useEffect( () => {
		if ( siteId && ! siteChecklist ) {
			dispatch( requestSiteChecklist( siteId, isSiteEligibleForFSE ) );
		}
	}, [ dispatch, siteId, siteChecklist, isSiteEligibleForFSE ] );

	return siteChecklist;
};

export default useSiteChecklist;
