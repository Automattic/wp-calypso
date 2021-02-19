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
		const searchParams = new URLSearchParams( window.location.search );
		searchParams.has( 'signup' ) && clearSignupDestinationCookie();

		if (
			previousPath &&
			'' !== previousPath &&
			previousPath !== window.location.href &&
			! previousPath.includes( '/checkout/no-site' )
		) {
			closeUrl = previousPath;
		}

		window.location = closeUrl;
	};

	render() {
		const { translate, title, isJetpackNotAtomic } = this.props;
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
					{ ! isJetpackNotAtomic && <WordPressWordmark className="masterbar__wpcom-wordmark" /> }
					{ isJetpackNotAtomic && <JetpackLogo className="masterbar__jetpack-wordmark" full /> }
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
