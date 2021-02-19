/**
 * External dependencies
 */

import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchJITM } from 'calypso/state/jitm/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

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
