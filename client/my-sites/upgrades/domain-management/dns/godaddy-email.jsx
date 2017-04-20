/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { dnsTemplates } from 'lib/domains/constants';
import { localize } from 'i18n-calypso';
import notices from 'notices';
import * as upgradesActions from 'lib/upgrades/actions';

class GoDaddyMail extends Component {
	constructor( props ) {
		super( props );
		this.state = { submitting: false };
	}

	onAddDnsRecords = ( event ) => {
		event.preventDefault();
		this.setState( { submitting: true } );

		const { domain, translate } = this.props;

		upgradesActions.applyDnsTemplate( domain, dnsTemplates.GODADDY_EMAIL, { domain }, ( error ) => {
			if ( error ) {
				notices.error( error.message || translate( 'The DNS records have not been added.' ) );
			} else {
				notices.success( translate( 'All DNS records that GoDaddy E-Mail needs have been added.' ), {
					duration: 5000
				} );
			}

			this.setState( { submitting: false } );
		} );
	}

	render() {
		return (
			<Button
				disabled={ this.state.submitting }
				onClick={ this.onAddDnsRecords }>
				{ this.props.translate( 'Setup GoDaddy E-Mail' ) }
			</Button>
		);
	}
}

export default localize( GoDaddyMail );
