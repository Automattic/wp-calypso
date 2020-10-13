/**
 * External dependencies
 */

import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchJITM } from 'calypso/state/jitm/actions';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

function QueryJITM( { siteId, sectionName, messagePath, doFetchJITM, locale } ) {
	useEffect( () => {
		doFetchJITM( siteId, messagePath, locale );
	}, [ siteId, sectionName, messagePath, locale ] );

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

const mapStateToProps = ( state ) => ( {
	locale: getCurrentUserLocale( state ),
} );

export default connect( mapStateToProps, { doFetchJITM: fetchJITM } )( QueryJITM );
