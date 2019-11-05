/**
 * External dependencies
 */

import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchJITM } from 'state/jitm/actions';

function QueryJITM( { siteId, sectionName, messagePath, doFetchJITM } ) {
	useEffect( () => {
		doFetchJITM( siteId, messagePath );
	}, [ siteId, sectionName, messagePath ] );

	return null;
}

QueryJITM.propTypes = {
	siteId: PropTypes.number.isRequired,
	sectionName: PropTypes.string,
	messagePath: PropTypes.string.isRequired,
};

QueryJITM.defaultProps = {
	sectionName: '',
};

export default connect( null, { doFetchJITM: fetchJITM } )( QueryJITM );
