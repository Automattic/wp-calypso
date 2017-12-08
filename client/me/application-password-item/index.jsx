/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { recordGoogleEvent } from 'state/analytics/actions';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { errorNotice } from 'state/notices/actions';
import Button from 'components/button';

class ApplicationPasswordsItem extends React.Component {
	state = {
		removingPassword: false,
	};

	handleRemovePasswordButtonClick = () => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on Remove Application Password Button' );
		this.removeApplicationPassword();
	};

	removeApplicationPassword() {
		this.setState( { removingPassword: true } );

		this.props.appPasswordsData.revoke(
			parseInt( this.props.password.ID, 10 ),
			function( error ) {
				if ( error && 'unknown_application_password' !== error.error ) {
					this.setState( { removingPassword: false } );
					this.props.errorNotice(
						this.props.translate(
							'The application password was not successfully deleted. Please try again.'
						)
					);
				}
			}.bind( this )
		);
	}

	render() {
		var password = this.props.password;
		return (
			<li className="application-password-item__password" key={ password.ID }>
				<div className="application-password-item__details">
					<h2 className="application-password-item__name">{ password.name }</h2>
					<p className="application-password-item__generated">
						{ this.props.translate( 'Generated on %s', {
							args: this.props.moment( password.generated ).format( 'MMM DD, YYYY @ h:mm a' ),
						} ) }
					</p>
				</div>
				<Button
					borderless
					className="application-password-item__revoke"
					onClick={ this.handleRemovePasswordButtonClick }
				>
					<Gridicon icon="cross" />
				</Button>
			</li>
		);
	}
}

export default connect( null, {
	errorNotice,
	recordGoogleEvent,
} )( localize( ApplicationPasswordsItem ) );
