/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

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

	renderLogo = ( stripeConnectAccount ) => {
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

	renderNameAndEmail = ( stripeConnectAccount ) => {
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

		let status = <span className="stripe__connect-account-status account-activated">
			{ translate( 'Activated' ) }
		</span>;

		if ( ! isActivated ) {
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
		const { stripeConnectAccount, translate } = this.props;

		return (
			<div className="stripe__connect-account">
				<h3 className="stripe__connect-account-heading">
					{ translate( 'Stripe account' ) }
				</h3>
				<div className="stripe__connect-account-body">
					{ this.renderLogo( stripeConnectAccount ) }
					<div className="stripe__connect-account-details">
						{ this.renderNameAndEmail( stripeConnectAccount ) }
						{ this.renderStatus( stripeConnectAccount ) }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( StripeConnectAccount );
