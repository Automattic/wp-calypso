/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Image from 'components/image';
import resizeImageUrl from 'lib/resize-image-url';

class StripeConnectAccount extends Component {
	static propTypes = {
		stripeConnectAccount: PropTypes.shape( {
			displayName: PropTypes.string,
			email: PropTypes.string,
			firstName: PropTypes.string,
			isActivated: PropTypes.bool,
			lastName: PropTypes.string,
			logo: PropTypes.string,
		} ),
		onDisconnect: PropTypes.func, // TODO - require most of these props in subsequent PR
	}

	renderLogo = () => {
		const { stripeConnectAccount } = this.props;
		const { logo } = stripeConnectAccount;

		let image = null;

		if ( ! isEmpty( logo ) ) {
			image = <Image src={ resizeImageUrl( logo, { w: 40, h: 40 } ) } className="stripe__connect-account-logo" />;
		}

		return (
			<div className="stripe__connect-account-logo-container">
				{ image }
			</div>
		);
	}

	renderNameAndEmail = () => {
		const { stripeConnectAccount } = this.props;
		const { displayName, email, firstName, lastName } = stripeConnectAccount;
		const name = ! isEmpty( displayName ) ? displayName : `${ firstName } ${ lastName }`;

		return (
			<div className="stripe__connect-account-details">
				<span className="stripe__connect-account-name">
					<span className="stripe__connect-account-name">{ name }</span>
					<span className="stripe__connect-account-email">{ email }</span>
				</span>
			</div>
		);
	}

	// TODO - when we are ready to connect this for-reals, this layer may not be needed
	onDisconnect = ( event ) => {
		event.preventDefault();
		if ( this.props.onDisconnect ) {
			this.props.onDisconnect();
		}
	}

	renderStatus = () => {
		const { stripeConnectAccount, translate } = this.props;
		const { isActivated } = stripeConnectAccount;

		let status = null;

		if ( isActivated ) {
			status = <span className="stripe__connect-account-status account-activated">
				{ translate( 'Activated' ) }
			</span>;
		} else {
			status = <span className="stripe__connect-account-status account-not-activated">
				{ translate( 'Check email to activate account' ) }
			</span>;
		}

		return (
			<div>
				{ status }
				<a href="#" className="stripe__connect-account-disconnect" onClick={ this.onDisconnect }>
					{ translate( 'Disconnect' ) }
				</a>
			</div>
		);
	}

	render = () => {
		const { translate } = this.props;

		return (
			<div className="stripe__connect-account">
				<h3 className="stripe__connect-account-heading">
					{ translate( 'Stripe account' ) }
				</h3>
				<div className="stripe__connect-account-body">
					{ this.renderLogo() }
					<div className="stripe__connect-account-details">
						{ this.renderNameAndEmail() }
						{ this.renderStatus() }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( StripeConnectAccount );
