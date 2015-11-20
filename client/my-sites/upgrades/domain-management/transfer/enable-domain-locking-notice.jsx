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
import { enableDomainLocking } from 'lib/upgrades/actions';

const EnableDomainLockingNotice = React.createClass( {
	propTypes: {
		selectedDomainName: React.PropTypes.string.isRequired,
		wapiDomainInfo: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return { submitting: false };
	},

	render() {
		if ( this.props.wapiDomainInfo.data.locked ) {
			return null;
		}

		return (
			<SimpleNotice showDismiss={ false } status={ null }>
				<p>
					{ this.translate(
						'This domain is currently {{strong}}unlocked{{/strong}}. If you ' +
						'are not intending on transferring this domain to another ' +
						'registrar, you are advised to re-enable Domain Locking.',
						{ components: { strong: <strong /> } }
					) }
				</p>

				<Button primary={ true }
						onClick={ this.handleEnableDomainLockingClick }
						disabled={ this.state.submitting }>
					{ this.translate( 'Enable Domain Locking' ) }
				</Button>
			</SimpleNotice>
		);
	},

	handleEnableDomainLockingClick() {
		this.setState( { submitting: true } );

		enableDomainLocking( this.props.selectedDomainName, ( error ) => {
			this.setState( { submitting: false } );
			this.displayEnableDomainLockingNotice( error );
		} );
	},

	displayEnableDomainLockingNotice( error ) {
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
				'Success! Your domain has been re-locked to prevent it being ' +
				'transferred.'
			)
		);
	}
} );

export default EnableDomainLockingNotice;
