import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestUserSuggestions } from 'calypso/state/user-suggestions/actions';
import { isRequestingUserSuggestions as isRequesting } from 'calypso/state/user-suggestions/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequesting( getState(), siteId ) ) {
		dispatch( requestUserSuggestions( siteId ) );
	}
};

function QueryUsersSuggestions( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId ) {
			dispatch( request( siteId ) );
		}
	}, [ dispatch, siteId ] );

	return null;
}

QueryUsersSuggestions.propTypes = {
	siteId: PropTypes.number,
};

export default QueryUsersSuggestions;
