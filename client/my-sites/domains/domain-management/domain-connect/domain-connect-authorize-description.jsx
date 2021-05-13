/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

class DomainConnectAuthorizeDescription extends Component {
	static propTypes = {
		isPlaceholder: PropTypes.bool,
		providerId: PropTypes.string.isRequired,
		dnsTemplateError: PropTypes.bool,
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	placeholder = () => {
		return (
			<div className="domain-connect__is-placeholder">
				<span />
				<span />
				<span />
			</div>
		);
	};

	render() {
		const { dnsTemplateError, isPlaceholder, providerId, translate } = this.props;

		if ( isPlaceholder ) {
			return this.placeholder();
		}

		// Note: these are only examples. The exact templates that we will use haven't yet been determined.
		const templateDescription = {
			'g-suite': translate(
				'Howdy! It looks like you want to make your domain work with ' +
					"{{strong}}Google's G Suite email service{{/strong}}.",
				{
					components: {
						strong: <strong />,
					},
				}
			),

			'microsoft-office365': translate(
				'Howdy! It looks like you want to set up your domain to ' +
					'work with the {{strong}}Microsoft Office 365 service{{/strong}}.',
				{
					components: {
						strong: <strong />,
					},
				}
			),

			'zoho-mail': translate(
				'Howdy! It looks like you want to set up ' +
					'{{strong}}Zoho Mail service{{/strong}} to work with your domain.',
				{
					components: {
						strong: <strong />,
					},
				}
			),

			'template-error': translate(
				'There seems to be a problem with the information we received ' +
					"about the service you're trying to set up. Contact your service providers support and " +
					'let them know about this error message.'
			),
		};

		if ( templateDescription[ providerId ] ) {
			return <p>{ templateDescription[ providerId ] }</p>;
		}

		if ( dnsTemplateError ) {
			return <p>{ templateDescription[ 'template-error' ] }</p>;
		}

		return null;
	}
}

export default localize( DomainConnectAuthorizeDescription );
