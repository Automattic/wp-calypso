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
import { Button } from '@automattic/components';
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
		isDeauthorizing: PropTypes.bool.isRequired,
		onDeauthorize: PropTypes.func.isRequired,
	};

	renderLogo = () => {
		const { stripeConnectAccount } = this.props;
		const { logo } = stripeConnectAccount;

		let image = null;

		if ( ! isEmpty( logo ) ) {
			image = (
				<Image
					src={ resizeImageUrl( logo, { w: 40, h: 40 } ) }
					className="stripe__connect-account-logo"
				/>
			);
		}

		return <div className="stripe__connect-account-logo-container">{ image }</div>;
	};

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
	};

	onDeauthorize = ( event ) => {
		event.preventDefault();
		this.props.onDeauthorize();
	};

	renderStatus = () => {
		const { isDeauthorizing, stripeConnectAccount, translate } = this.props;
		const { isActivated } = stripeConnectAccount;

		let status = null;
		let deauthorize = null;

		if ( isActivated ) {
			status = (
				<span className="stripe__connect-account-status account-activated">
					{ translate( 'Activated' ) }
				</span>
			);
		} else {
			status = (
				<span className="stripe__connect-account-status account-not-activated">
					{ translate( 'Check email to activate account' ) }
				</span>
			);
		}

		if ( isDeauthorizing ) {
			deauthorize = (
				<span className="stripe__connect-account-disconnect">{ translate( 'Disconnecting' ) }</span>
			);
		} else {
			deauthorize = (
				<Button
					borderless
					className="stripe__connect-account-disconnect"
					onClick={ this.onDeauthorize }
				>
					{ translate( 'Disconnect' ) }
				</Button>
			);
		}

		return (
			<div>
				{ status }
				{ deauthorize }
			</div>
		);
	};

	render = () => {
		const { translate } = this.props;

		return (
			<div className="stripe__connect-account">
				<h3 className="stripe__connect-account-heading">{ translate( 'Stripe account' ) }</h3>
				<div className="stripe__connect-account-body">
					{ this.renderLogo() }
					<div className="stripe__connect-account-details">
						{ this.renderNameAndEmail() }
						{ this.renderStatus() }
					</div>
				</div>
			</div>
		);
	};
}

export default localize( StripeConnectAccount );
