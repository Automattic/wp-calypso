import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';

class DomainConnectAuthorizeDescription extends Component {
	static propTypes = {
		dnsTemplateError: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		providerId: PropTypes.string.isRequired,
		serviceId: PropTypes.string.isRequired,
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
		const { dnsTemplateError, isPlaceholder, providerId, serviceId, translate } = this.props;

		if ( isPlaceholder ) {
			return this.placeholder();
		}

		if ( providerId === 'google.com' && serviceId === 'gmail-setup' ) {
			return (
				<p>
					{ translate(
						'Howdy! It looks like you want to make your domain work with the ' +
							'{{strong}}Google Workspace email service{{/strong}}.',
						{ components: { strong: <strong /> } }
					) }
				</p>
			);
		}

		if ( providerId === 'microsoft.com' && serviceId === 'O365' ) {
			return (
				<p>
					{ translate(
						'Howdy! It looks like you want to set up your domain to ' +
							'work with the {{strong}}Microsoft Office 365 service{{/strong}}.',
						{ components: { strong: <strong /> } }
					) }
				</p>
			);
		}

		if ( dnsTemplateError ) {
			return (
				<p>
					{ translate(
						'There seems to be a problem with the information we received ' +
							"about the service you're trying to set up. Contact your service providers support and " +
							'let them know about this error message.'
					) }
				</p>
			);
		}

		return null;
	}
}

export default localize( DomainConnectAuthorizeDescription );
