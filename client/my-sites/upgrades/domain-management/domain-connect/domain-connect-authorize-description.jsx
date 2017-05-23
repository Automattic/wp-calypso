/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

class DomainConnectAuthorizeDescription extends Component {
	placeholder = () => {
		return (
			<div className="domain-connect__is-placeholder">
				<span></span>
				<span></span>
				<span></span>
			</div>
		);
	}

	getDescription = () => {
		const { providerId, translate } = this.props;

		switch ( providerId ) {
			case 'g-suite':
				return translate( 'Howdy! It looks like you want to make your domain work with the ' +
					'{{strong}}Google G Suite email service{{/strong}}.', {
						components: {
							strong: <strong />
						}
					} );

			case 'microsoft-office365':
				return translate( 'Howdy! It looks like you want to make your domain work with the ' +
					'{{strong}}Microsoft Office 365 service{{/strong}}.', {
						components: {
							strong: <strong />
						}
					} );

			case 'zoho-mail':
				return translate( 'Howdy! It looks like you want to make your domain work with the ' +
					'{{strong}}Zoho Mail service{{/strong}}.', {
						components: {
							strong: <strong />
						}
					} );

			default:
				return null;
		}
	}

	render() {
		const { isLoading } = this.props;

		if ( isLoading ) {
			return this.placeholder();
		}

		const description = this.getDescription();
		if ( description ) {
			return (
				<div>
					<p>
						{ this.getDescription() }
					</p>
				</div>
			);
		}

		return null;
	}
}

DomainConnectAuthorizeDescription.propTypes = {
	isLoading: PropTypes.bool,
	providerId: PropTypes.string.isRequired
};

DomainConnectAuthorizeDescription.defaultProps = {
	isLoading: false
};

export default localize( DomainConnectAuthorizeDescription );
