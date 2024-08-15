import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJITM } from 'calypso/state/jitm/actions';
import { getLocale } from 'calypso/state/user-profile/selectors';

export default function QueryJITM( { siteId, messagePath, searchQuery } ) {
	const locale = useSelector( ( state ) => getLocale( state, siteId ) );
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( fetchJITM( siteId, messagePath, searchQuery, locale ) );
	}, [ dispatch, siteId, messagePath, searchQuery, locale ] );

	return null;
}

QueryJITM.propTypes = {
	siteId: PropTypes.number.isRequired,
	messagePath: PropTypes.string.isRequired,
};
