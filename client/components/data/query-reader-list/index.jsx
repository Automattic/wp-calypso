import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestList } from 'calypso/state/reader/lists/actions';
import { isRequestingList } from 'calypso/state/reader/lists/selectors';

const request = ( owner, slug ) => ( dispatch, getState ) => {
	if ( ! isRequestingList( getState(), owner, slug ) ) {
		dispatch( requestList( owner, slug ) );
	}
};

function QueryReaderList( { owner, slug } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( owner, slug ) );
	}, [ dispatch, owner, slug ] );

	return null;
}

QueryReaderList.propTypes = {
	owner: PropTypes.string,
	slug: PropTypes.string,
};

export default QueryReaderList;
