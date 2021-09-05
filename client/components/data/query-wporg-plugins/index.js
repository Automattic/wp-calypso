import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPluginsList } from 'calypso/state/plugins/wporg/actions';

export default function QueryWporgPlugins( { category, page, searchTerm } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchPluginsList( category, page, searchTerm ) );
	}, [ dispatch, category, page, searchTerm ] );

	return null;
}

QueryWporgPlugins.propTypes = {
	category: PropTypes.string,
	page: PropTypes.number,
	searchTerm: PropTypes.string,
};
