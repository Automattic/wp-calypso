/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Masterbar from './masterbar';
import Item from './item';
import WordPressWordmark from 'calypso/components/wordpress-wordmark';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';

class CheckoutMasterbar extends React.Component {
	clickClose = () => {
		const { previousPath, siteSlug } = this.props;
		let closeUrl = siteSlug ? '/plans/' + siteSlug : '/start';
		this.props.recordTracksEvent( 'calypso_masterbar_close_clicked' );

		if (
			previousPath &&
			'' !== previousPath &&
			previousPath !== window.location.href &&
			! previousPath.includes( '/checkout/' )
		) {
			closeUrl = previousPath;
		}

		try {
			const searchParams = new URLSearchParams( window.location.search );
			searchParams.has( 'signup' ) && clearSignupDestinationCookie();
			if ( searchParams.has( 'redirect_to' ) ) {
				closeUrl = searchParams.get( 'redirect_to' );
			}
		} catch ( error ) {
			// Silently ignore query string errors (eg: which may occur in IE since it doesn't support URLSearchParams).
			console.error( 'Error getting query string in close button' ); // eslint-disable-line no-console
		}

		window.location = closeUrl;
	};

	render() {
		const { translate, title, isJetpackNotAtomic } = this.props;
		const isJetpackUserlessCheckout = window.location.pathname.startsWith( '/checkout/jetpack' );
		const isJetpack = isJetpackUserlessCheckout || isJetpackNotAtomic;

		return (
			<Masterbar>
				<div className="masterbar__secure-checkout">
					<Item
						url={ '#' }
						icon="cross"
						className="masterbar__close-button"
						onClick={ this.clickClose }
						tooltip={ translate( 'Close Checkout' ) }
						tipTarget="close"
					/>
					{ ! isJetpack && <WordPressWordmark className="masterbar__wpcom-wordmark" /> }
					{ isJetpack && <JetpackLogo className="masterbar__jetpack-wordmark" full /> }
					<span className="masterbar__secure-checkout-text">
						{ translate( 'Secure checkout' ) }
					</span>
				</div>
				<Item className="masterbar__item-title">{ title }</Item>
			</Masterbar>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( CheckoutMasterbar ) );
