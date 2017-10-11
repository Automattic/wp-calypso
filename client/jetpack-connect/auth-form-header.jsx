/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getAuthorizationData, isRemoteSiteOnSitesList } from 'state/jetpack-connect/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import FormattedHeader from 'components/formatted-header';
import SiteCard from './site-card';
import versionCompare from 'lib/version-compare';

class AuthFormHeader extends Component {
	getState() {
		const { user, authorize } = this.props;

		if ( ! user ) {
			return 'logged-out';
		}

		if ( authorize.authorizeSuccess ) {
			return 'logged-in-success';
		}

		return 'logged-in';
	}

	getHeaderText() {
		const { translate } = this.props;

		switch ( this.getState() ) {
			case 'logged-out':
				return translate( 'Create your account' );
			case 'logged-in-success':
				return translate( 'You are connected!' );
			case 'logged-in':
			default:
				return translate( 'Completing connection' );
		}
	}

	getSubHeaderText() {
		const { translate } = this.props;

		switch ( this.getState() ) {
			case 'logged-out':
				return translate( 'You are moments away from connecting your site.' );
			case 'logged-in-success':
				return translate( 'Thank you for flying with Jetpack' );
			case 'logged-in':
			default:
				return translate( 'Jetpack is finishing up the connection process' );
		}
	}

	getSiteCard() {
		const version = get( this.props, [ 'authorize', 'queryObject', 'jp_version' ], '0.1' );
		if ( ! versionCompare( version, '4.0.3', '>' ) ) {
			return null;
		}

		return (
			<SiteCard
				queryObject={ get( this.props, [ 'authorize', 'queryObject' ], {} ) }
				isAlreadyOnSitesList={ !! this.props.isAlreadyOnSitesList }
			/>
		);
	}

	render() {
		return (
			<div>
				<FormattedHeader
					headerText={ this.getHeaderText() }
					subHeaderText={ this.getSubHeaderText() }
				/>
				{ this.getSiteCard() }
			</div>
		);
	}
}

export default connect( state => {
	const authorize = getAuthorizationData( state );
	return {
		authorize,
		user: getCurrentUser( state ),
		isAlreadyOnSitesList: isRemoteSiteOnSitesList( state ),
	};
} )( localize( AuthFormHeader ) );
