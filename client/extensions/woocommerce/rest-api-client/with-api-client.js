/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getApiClient } from './index';

export default function withApiClient( apiType, mapApiToProps, siteKeyProp = 'apiSiteKey' ) {
	return function connectWithApiClient( WrappedComponent ) {
		function mapStateToProps( state, ownProps ) {
			const siteKey = ownProps[ siteKeyProp ];
			const apiClient = getApiClient( apiType, siteKey );
			return mapApiToProps( apiClient, ownProps, state );
		}
		return connect( mapStateToProps )( WrappedComponent );
	};
}
