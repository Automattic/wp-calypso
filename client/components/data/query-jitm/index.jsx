import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { fetchJITM } from 'calypso/state/jitm/actions';

export default function QueryJITM( { siteId, messagePath } ) {
	const locale = useSelector( getCurrentUserLocale );
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( fetchJITM( siteId, messagePath, locale ) );
	}, [ dispatch, siteId, messagePath, locale ] );

	return null;
}

QueryJITM.propTypes = {
	siteId: PropTypes.number.isRequired,
	messagePath: PropTypes.string.isRequired,
};
