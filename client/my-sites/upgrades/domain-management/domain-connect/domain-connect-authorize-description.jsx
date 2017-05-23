/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

class DomainConnectAuthorizeDescription extends Component {
	static propTypes = {
		isLoading: PropTypes.bool,
		providerId: PropTypes.string.isRequired
	};

	static defaultProps = {
		isLoading: false
	};

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
					'{{strong}}Google\'s G Suite email service{{/strong}}.', {
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
				<p>
					{ description }
				</p>
			);
		}

		return null;
	}
}

export default localize( DomainConnectAuthorizeDescription );
