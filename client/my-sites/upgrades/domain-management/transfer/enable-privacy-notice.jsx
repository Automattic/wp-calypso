/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import notices from 'notices';
import SimpleNotice from 'notices/simple-notice';
import { enablePrivacyProtection } from 'lib/upgrades/actions';
import { getSelectedDomain } from 'lib/domains';

const EnablePrivacyNotice = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return { submitting: false };
	},

	render() {
		const { privateDomain, hasPrivacyProtection } = getSelectedDomain( this.props );

		if ( privateDomain || ! hasPrivacyProtection ) {
			return null;
		}

		return (
			<SimpleNotice showDismiss={ false } status={ null }>
				<p>
					{ this.translate(
						'Although you have purchased Private Registration for this ' +
						'domain, Private Registration is currently disabled to allow you ' +
						'to transfer the domain.'
					) }
				</p>

				<p>
					{ this.translate(
						"If you don't intend on transferring this domain to another " +
						'registrar, you should re-enable Private Registration now.'
					) }
				</p>

				<Button primary={ true }
						onClick={ this.handleEnablePrivacyClick }
						disabled={ this.state.submitting }>
					{ this.translate( 'Enable Private Registration' ) }
				</Button>
			</SimpleNotice>
		);
	},

	handleEnablePrivacyClick() {
		this.setState( { submitting: true } );

		const options = {
			siteId: this.props.selectedSite.ID,
			domainName: this.props.selectedDomainName
		};

		enablePrivacyProtection( options, ( error ) => {
			this.setState( { submitting: false } );
			this.displayEnablePrivacyNotice( error );
		} );
	},

	displayEnablePrivacyNotice( error ) {
		if ( error ) {
			notices.error(
				this.translate(
					'Oops! Something went wrong and your request could not be ' +
					'processed. Please try again or {{a}}Contact Support{{/a}} if ' +
					'you continue to have trouble.',
					{
						components: {
							a: (
								<a href="https://support.wordpress.com/contact/"
									target="_blank" />
							)
						}
					}
				)
			);

			return;
		}

		notices.success(
			this.translate(
				'Success! Private Registration was re-enabled on your domain. ' +
				'It may take a few minutes for the public contact details for ' +
				'the domain to update.'
			)
		);
	}
} );

export default EnablePrivacyNotice;
