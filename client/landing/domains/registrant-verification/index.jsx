/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, join } from 'lodash';

/**
 * Internal dependencies
 */
import DomainsLandingHeader from '../header';
import DomainsLandingContentCard from '../content-card';
import { CALYPSO_CONTACT } from 'lib/url/support';
import wp from 'lib/wp';
import { getMaintenanceMessageFromError } from '../utils';

const wpcom = wp.undocumented();

class RegistrantVerificationPage extends Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		token: PropTypes.string.isRequired,
	};

	state = {
		isLoading: true,
		success: false,
		error: false,
	};

	constructor( props ) {
		super( props );
		this.state = this.getLoadingState();
	}

	UNSAFE_componentWillMount() {
		const { domain, email, token } = this.props;
		wpcom.domainsVerifyRegistrantEmail( domain, email, token ).then(
			( response ) => {
				this.setState( this.getVerificationSuccessState( get( response, 'domains', [ domain ] ) ) );
			},
			( error ) => {
				this.setErrorState( error );
			}
		);
	}

	getLoadingState = () => {
		const { translate } = this.props;
		return {
			isLoading: true,
			title: translate( 'Verifying your contact information…' ),
			message: 'Loading…',
			actionTitle: null,
			actionCallback: null,
			footer: 'Loading…',
		};
	};

	getVerificationSuccessState = ( domains ) => {
		const { translate } = this.props;

		const verifiedDomains = join( domains, ', ' );

		return {
			title: translate( 'Success!' ),
			message: translate(
				'Thank your for verifying your contact information for:{{br /}}{{strong}}%(domain)s{{/strong}}.',
				{
					args: {
						domain: verifiedDomains,
					},
					components: {
						strong: <strong />,
						br: <br />,
					},
				}
			),
			actionTitle: null,
			actionCallback: null,
			footer: translate( 'All done. You can close this window now.' ),
			isLoading: false,
		};
	};

	getExpiredState = () => {
		const { translate } = this.props;

		return {
			message: translate(
				'This email has expired.{{br/}}Please resend the verification email and try again.',
				{
					components: {
						br: <br />,
					},
				}
			),
			actionTitle: translate( 'Resend Email' ),
			actionCallback: this.resendEmail,
		};
	};

	getEmailMismatchState = () => {
		const { domain, email, translate } = this.props;

		return {
			message: translate(
				'{{strong}}%(email)s{{/strong}} is different from the email we have on record for {{strong}}%(domain)s{{/strong}}.',
				{
					args: {
						email: email,
						domain: domain,
					},
					components: {
						strong: <strong />,
					},
				}
			),
		};
	};

	getKeySystemsErrorState = ( errorMessage ) => {
		if (
			'Invalid attribute value; Contact verification already confirmed, nothing to do' ===
			errorMessage
		) {
			const { domain, email, translate } = this.props;

			return {
				title: translate( 'Already verified.' ),
				message: translate(
					"You've already verified {{strong}}%(email)s{{/strong}} for:{{br /}}{{strong}}%(domain)s{{/strong}}.",
					{
						args: {
							email: email,
							domain: domain,
						},
						components: {
							strong: <strong />,
							br: <br />,
						},
					}
				),
				footer: translate( 'All done. You can close this window now.' ),
			};
		}
	};

	getResendEmailErrorState = () => {
		const { translate } = this.props;

		return {
			message: translate( "Sorry, we weren't able to re-send the email." ),
		};
	};

	getDefaultErrorState = () => {
		const { translate } = this.props;
		const defaultErrorFooter = translate(
			"If you're having trouble verifying your contact information, please {{a}}{{strong}}contact support{{/strong}}{{/a}}.",
			{
				components: {
					a: <a href={ CALYPSO_CONTACT } />,
					strong: <strong />,
				},
			}
		);

		return {
			title: translate( 'Uh oh!' ),
			message: translate( 'Hmm. Something went wrong.' ),
			messageAlignCenter: true,
			actionTitle: null,
			actionCallback: null,
			footer: defaultErrorFooter,
			isLoading: false,
		};
	};

	getRunningMaintenanceErrorState = ( error ) => {
		const { translate } = this.props;

		const message = getMaintenanceMessageFromError( error, translate );

		return {
			title: translate( 'Domain maintenance in progress' ),
			message: message,
		};
	};

	setErrorState = ( error ) => {
		let errorState;

		switch ( error.error ) {
			case 'email_mismatch':
				errorState = this.getEmailMismatchState();
				break;

			case 'unauthorized':
				errorState = this.getExpiredState();
				break;

			case 'KS_RAM_error':
				errorState = this.getKeySystemsErrorState( error.message );
				break;

			case 'resend_email_failed':
				errorState = this.getResendEmailErrorState();
				break;

			case 'domain_registration_unavailable':
			case 'tld-in-maintenance':
				errorState = this.getRunningMaintenanceErrorState( error );
				break;
		}

		this.setState( {
			...this.getDefaultErrorState(),
			...errorState,
		} );
	};

	resendEmail = () => {
		const { domain, translate } = this.props;

		this.setState( this.getLoadingState() );

		wpcom.resendIcannVerification( domain, ( error ) => {
			if ( error ) {
				this.setErrorState( { error: 'resend_email_failed' } );
			} else {
				this.setState( {
					title: translate( 'Email sent!' ),
					message: translate( 'Check your email.' ),
					actionTitle: null,
					actionCallback: null,
					footer: translate( "That's all for now. We'll see you again soon." ),
					isLoading: false,
				} );
			}
		} );
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="registrant-verification">
				<DomainsLandingHeader title={ translate( 'Domain Contact Verification' ) } />
				<DomainsLandingContentCard
					title={ this.state.title }
					message={ this.state.message }
					messageAlignCenter={ this.state.messageAlignCenter }
					actionTitle={ this.state.actionTitle }
					actionCallback={ this.state.actionCallback }
					footer={ this.state.footer }
					isLoading={ this.state.isLoading }
				/>
			</div>
		);
	}
}

export default localize( RegistrantVerificationPage );
