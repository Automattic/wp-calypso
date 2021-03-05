/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSelectedEditor } from 'calypso/state/selected-editor/actions';

export default function QuerySiteSelectedEditor( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId ) {
			dispatch( requestSelectedEditor( siteId ) );
		}
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteSelectedEditor.propTypes = { siteId: PropTypes.number };
