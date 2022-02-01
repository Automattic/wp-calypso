import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { requestSiteChecklist } from 'calypso/state/checklist/actions';
import isSiteEligibleForLegacyFSE from 'calypso/state/selectors/is-site-eligible-for-legacy-fse';

export default function QuerySiteChecklist( { siteId } ) {
	const dispatch = useDispatch();
	const isSiteEligibleForFSE = useSelector( ( state ) =>
		isSiteEligibleForLegacyFSE( state, siteId )
	);

	useEffect( () => {
		if ( siteId ) {
			dispatch( requestSiteChecklist( siteId, isSiteEligibleForFSE ) );
		}
	}, [ dispatch, siteId, isSiteEligibleForFSE ] );

	return null;
}

QuerySiteChecklist.propTypes = { siteId: PropTypes.number.isRequired };
