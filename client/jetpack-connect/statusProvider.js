/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get, includes, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { authQueryPropTypes } from './utils';
import { isRequestingSite, isRequestingSites } from 'state/sites/selectors';
import {
	ALREADY_CONNECTED,
	ALREADY_CONNECTED_BY_OTHER_USER,
	DEFAULT_AUTHORIZE_ERROR,
	SECRET_EXPIRED,
	USER_IS_ALREADY_CONNECTED_TO_SITE,
	XMLRPC_ERROR,
} from './connection-notice-types';
import {
	getAuthorizationData,
	getUserAlreadyConnected,
	hasExpiredSecretError as hasExpiredSecretErrorSelector,
	hasXmlrpcError as hasXmlrpcErrorSelector,
	isRemoteSiteOnSitesList,
} from 'state/jetpack-connect/selectors';

/**
 * Constants
 */
export const states = {
	ERROR: 'ERROR',
	IDLE: 'NOT_AUTHORIZED',
	AUTHORIZED: 'AUTHORIZED',
	AUTHORIZING: 'AUTHORIZING',
};

export default function statusProvider( WrappedComponent ) {
	return connect( mapStateToProps )(
		class extends Component {
			static propTypes = {
				authQuery: authQueryPropTypes.isRequired,

				// Connected props
				authorizationData: PropTypes.shape( {
					authorizationCode: PropTypes.string,
					authorizeError: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ),
					authorizeSuccess: PropTypes.bool,
				} ).isRequired,
				hasExpiredSecretError: PropTypes.bool,
				hasXmlrpcError: PropTypes.bool,
				isAlreadyOnSitesList: PropTypes.bool,
				isFetchingAuthorizationSite: PropTypes.bool,
				isFetchingSites: PropTypes.bool,
				userAlreadyConnected: PropTypes.bool.isRequired,
			};

			calculateError() {
				const { authorizeError, userAlreadyConnected } = this.props.authorizationData;
				const { alreadyAuthorized } = this.props.authQuery;

				if (
					alreadyAuthorized &&
					! this.props.isFetchingSites &&
					! this.props.isAlreadyOnSitesList
				) {
					// For users who start their journey at `wordpress.com/jetpack/connect` or similar flows, we will discourage
					// additional users from linking. Although it is possible to link multiple users with Jetpack, the `jetpack/connect`
					// flows will be reserved for brand new connections.
					return ALREADY_CONNECTED_BY_OTHER_USER;
				}

				if ( userAlreadyConnected ) {
					// Via wp-admin it is possible to connect additional users after the initial connection is made. But if we
					// are trying to connect an additional user, and we are logged into a wordpress.com account that is already
					// connected, we need to show an error.
					return USER_IS_ALREADY_CONNECTED_TO_SITE;
				}

				if ( ! authorizeError ) {
					return null;
				}

				if ( includes( get( authorizeError, 'message' ), 'already_connected' ) ) {
					return ALREADY_CONNECTED;
				}
				if ( this.props.hasExpiredSecretError ) {
					return SECRET_EXPIRED;
				}
				if ( this.props.hasXmlrpcError ) {
					return XMLRPC_ERROR;
				}
				return DEFAULT_AUTHORIZE_ERROR;
			}

			calculateState() {
				const { isFetchingAuthorizationSite } = this.props;
				const { authorizeError, authorizeSuccess, isAuthorizing } = this.props.authorizationData;

				if ( isFetchingAuthorizationSite || isAuthorizing ) {
					return states.AUTHORIZING;
				}

				if ( authorizeSuccess ) {
					return states.AUTHORIZED;
				}

				if ( authorizeError ) {
					return states.ERROR;
				}

				return states.IDLE;
			}

			render() {
				return (
					<WrappedComponent
						{ ...omit(
							[
								'authorizationData',
								'hasExpiredSecretError',
								'hasXmlrpcError',
								'isAlreadyOnSitesList',
								'isFetchingAuthorizationSite',
								'isFetchingSites',
								'userAlreadyConnected',
							],
							this.props
						) }
						state={ this.calculateState() }
						error={ this.calculateError() }
					/>
				);
			}
		}
	);
}

function mapStateToProps( state, { authQuery } ) {
	return {
		authorizationData: getAuthorizationData( state ),
		hasExpiredSecretError: hasExpiredSecretErrorSelector( state ),
		hasXmlrpcError: hasXmlrpcErrorSelector( state ),
		isAlreadyOnSitesList: isRemoteSiteOnSitesList( state, authQuery.site ),
		isFetchingAuthorizationSite: isRequestingSite( state, authQuery.clientId ),
		isFetchingSites: isRequestingSites( state ),
		userAlreadyConnected: getUserAlreadyConnected( state ),
	};
}
