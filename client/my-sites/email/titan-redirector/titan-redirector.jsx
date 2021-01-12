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
import wp from 'calypso/lib/wp';
import EmptyContent from 'calypso/components/empty-content';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';

class TitanRedirector extends Component {
	state = {
		loaded: false,
		hasError: false,
		action: null,
		orderId: null,
		subscriptionId: null,
		error: null,
	};

	componentDidMount() {
		const { mode, jwt } = this.props;

		wp.undocumented()
			.getTitanIncomingURL( mode, jwt )
			.then(
				( data ) => {
					this.setState( {
						hasError: false,
						loaded: true,
						action: data?.action,
						orderId: data?.order_id,
						subscriptionId: data?.subscription_id,
					} );
				},
				( error ) => {
					this.setState( {
						hasError: true,
						loaded: true,
						error: error?.message,
					} );
				}
			);
	}

	render() {
		const { translate, isLoggedIn } = this.props;
		const { loaded, hasError, error, action, subscriptionId } = this.state;

		if ( ! isLoggedIn ) {
			return (
				<EmptyContent
					title={ translate( 'You need to be logged in WordPress.com to open this page' ) }
					action={ 'whaat' }
				/>
			);
		}

		if ( ! loaded ) {
			return <EmptyContent title={ translate( 'Loading…' ) } />;
		}

		if ( loaded && hasError ) {
			return <EmptyContent title={ translate( 'Oops - an error occurred' ) } line={ error } />;
		}

		if ( ! subscriptionId ) {
			return <EmptyContent title={ translate( 'No subscription found' ) } />;
		}

		if ( 'billing' === action ) {
			return <div>You'll be redirected to: { getManagePurchaseUrlFor( '', subscriptionId ) }</div>;
			// eslint-disable-next-line no-constant-condition,no-unreachable
			if ( false ) {
				page( getManagePurchaseUrlFor( '', subscriptionId ) );
			}
		}
	}
}

export default connect( ( state ) => {
	return {
		isLoggedIn: isUserLoggedIn( state ),
	};
} )( localize( TitanRedirector ) );
