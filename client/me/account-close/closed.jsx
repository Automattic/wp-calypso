/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import Spinner from 'components/spinner';
import getPreviousRoute from 'state/selectors/get-previous-route';
import isAccountClosed from 'state/selectors/is-account-closed';

/**
 * Style dependencies
 */
import './closed.scss';

class AccountSettingsClosedComponent extends Component {
	render() {
		/* eslint-disable-next-line no-shadow */
		const { isAccountClosed, previousRoute, translate } = this.props;

		if ( previousRoute !== '/me/account/close' ) {
			page( '/me/account/close' );
		}

		if ( ! isAccountClosed ) {
			return (
				<div className="account-close__spinner">
					<Spinner size={ 32 } />
					<p className="account-close__spinner-text">
						{ translate( 'Your account is being deleted' ) }
					</p>
				</div>
			);
		}

		return (
			<EmptyContent
				title={ translate( 'Your account has been closed' ) }
				line={ translate( 'Thanks for flying with WordPress.com' ) }
			/>
		);
	}
}

export default connect( state => {
	return {
		previousRoute: getPreviousRoute( state ),
		isAccountClosed: isAccountClosed( state ),
	};
} )( localize( AccountSettingsClosedComponent ) );
