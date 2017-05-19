/**
 * External dependencies
 */
import React, { Component } from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Main from 'components/main';
import notices from 'notices';
import Card from 'components/card/compact';
import upgradesActions from 'lib/upgrades/actions';

class DomainConnectAuthorize extends Component {
	handleClickConfirm = () => {
		const { provider_id, params } = this.props,
			{ domain } = params;

		upgradesActions.applyDnsTemplate( domain, provider_id, params, ( error ) => {
			if ( error ) {
				notices.error( error.message || translate( 'The DNS records were not able to be added.' ) );
			} else {
				notices.success( translate( 'All DNS records for this service have been added.' ), {
					duration: 5000
				} );
			}

			this.setState( { submitting: false } );
		} );
	}

	handleClickCancel = () => {
		window.close();
	}

	render() {
		const { template_id, params } = this.props,
			{ domain } = params;

		return (
			<Main className="domain-connect__main">
				<Card>
					<h2>Authorize New DNS Records</h2>
					<p>
						Howdy! It looks like you want to make <strong>{ domain }</strong> work with <strong>{ template_id }</strong>.
						This means that we'll be adding some new DNS records for you.
					</p>
					<p>
						When you're ready to proceed, click Confirm. If this isn't what you meant to do,
						click Cancel and we won't add the records.
					</p>
					<div>
						<Button
							className="domain-connect__button"
							primary
							onClick={ this.handleClickConfirm }>
							Confirm
						</Button>
						<Button
							className="domain-connect__button"
							onClick={ this.handleClickCancel }>
							Cancel
						</Button>
					</div>
				</Card>
			</Main>
		);
	}
}

export default DomainConnectAuthorize;
