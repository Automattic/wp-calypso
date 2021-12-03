import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestMediaStorage } from 'calypso/state/sites/media-storage/actions';

function QueryMediaStorage( { siteId } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( requestMediaStorage( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryMediaStorage.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryMediaStorage;
