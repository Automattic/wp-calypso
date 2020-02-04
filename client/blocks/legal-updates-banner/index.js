/**
 * External dependencies
 */
import { useEffect } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestLegalData } from 'state/legal/actions';

const LegalUpdateBanner = ( { fetchLegalData } ) => {
	useEffect( () => {
		fetchLegalData();
	}, [] );

	return null;
};

export default connect( null, {
	fetchLegalData: requestLegalData,
} )( LegalUpdateBanner );
