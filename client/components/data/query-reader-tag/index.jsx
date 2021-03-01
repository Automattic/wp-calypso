/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestTags } from 'calypso/state/reader/tags/items/actions';

const QueryReaderTag = ( { tag, requestTags: request } ) => {
	useEffect( () => {
		request( tag );
	}, [ request, tag ] );
	return null;
};

QueryReaderTag.propTypes = {
	requestTags: PropTypes.func.isRequired,
	tag: PropTypes.string.isRequired,
};

export default connect( null, { requestTags } )( QueryReaderTag );
