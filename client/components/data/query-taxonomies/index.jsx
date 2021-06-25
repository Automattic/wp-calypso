/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostTypeTaxonomies } from 'calypso/state/post-types/taxonomies/actions';
import { isRequestingPostTypeTaxonomies } from 'calypso/state/post-types/taxonomies/selectors';

const request = ( siteId, postType ) => ( dispatch, getState ) => {
	if ( ! isRequestingPostTypeTaxonomies( getState(), siteId, postType ) ) {
		dispatch( requestPostTypeTaxonomies( siteId, postType ) );
	}
};

function QueryTaxonomies( { siteId, postType } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId && postType ) {
			dispatch( request( siteId, postType ) );
		}
	}, [ dispatch, siteId, postType ] );

	return null;
}

QueryTaxonomies.propTypes = {
	siteId: PropTypes.number.isRequired,
	postType: PropTypes.string.isRequired,
};

export default QueryTaxonomies;
