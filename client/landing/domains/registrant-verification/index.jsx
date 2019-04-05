/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import DomainsLandingHeader from '../header';
import { CALYPSO_CONTACT } from 'lib/url/support';
import wp from 'lib/wp';

/**
 *
 * Style dependencies
 */
import './style.scss';

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

	componentWillMount() {
		const { domain, email, token } = this.props;
		wpcom.domainsVerifyRegistrantEmail( domain, email, token ).then(
			() => {
				this.setState( this.getVerificationSuccessState() );
			},
			error => {
				this.setErrorState( error );
			}
		);
	}

	getLoadingState = () => {
		const { translate } = this.props;
		return {
			isLoading: true,
			illustration: '/calypso/images/illustrations/whoops.svg',
			title: translate( 'Verifying your contact information…' ),
			message: 'Loading…',
			actionTitle: null,
			actionCallback: null,
			footer: 'Loading…',
		};
	};

	getVerificationSuccessState = () => {
		const { domain, translate } = this.props;
		return {
			illustration: '/calypso/images/illustrations/illustration-ok.svg',
			title: translate( 'Success!' ),
			message: translate(
				'Thank your for verifying your contact information for:{{br /}}{{strong}}%(domain)s{{/strong}}.',
				{
					args: {
						domain: domain,
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

	getKeySystemsErrorState = errorMessage => {
		if (
			'Invalid attribute value; Contact verification already confirmed, nothing to do' ===
			errorMessage
		) {
			const { domain, email, translate } = this.props;

			return {
				illustration: '/calypso/images/illustrations/illustration-ok.svg',
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
			illustration: '/calypso/images/illustrations/error.svg',
			message: translate( 'Hmm. Something went wrong.' ),
			actionTitle: null,
			actionCallback: null,
			footer: defaultErrorFooter,
			isLoading: false,
		};
	};

	setErrorState = error => {
		let errorState;

		switch ( error.error ) {
			case 'email_mismatch':
				errorState = this.getEmailMismatchState();
				break;

			case 'unauthorized':
				errorState = this.getExpiredState();
				break;

			case 'Key_Systems_error':
				errorState = this.getKeySystemsErrorState( error.message );
				break;

			case 'resend_email_failed':
				errorState = this.getResendEmailErrorState();
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

		wpcom.resendIcannVerification( domain, error => {
			if ( error ) {
				this.setErrorState( { error: 'resend_email_failed' } );
			} else {
				this.setState( {
					illustration: '/calypso/images/illustrations/illustration-ok.svg',
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
		const contentClasses = classNames( 'registrant-verification__content', {
			'registrant-verification__loading-placeholder': this.state.isLoading,
		} );

		return (
			<div className="registrant-verification">
				<DomainsLandingHeader title={ translate( 'Domain Contact Verification' ) } />
				<CompactCard className={ contentClasses }>
					{ this.state.illustration && <img src={ this.state.illustration } alt="" /> }
					{ this.state.title && (
						<h2 className="registrant-verification__title">{ this.state.title }</h2>
					) }
					{ this.state.message && (
						<h3 className="registrant-verification__message">{ this.state.message }</h3>
					) }
					{ this.state.actionTitle && (
						<Button
							className="registrant-verification__action-button"
							primary
							onClick={ this.state.actionCallback }
						>
							{ this.state.actionTitle }
						</Button>
					) }
					{ this.state.footer && (
						<p className="registrant-verification__footer">{ this.state.footer }</p>
					) }
				</CompactCard>
			</div>
		);
	}
}

export default localize( RegistrantVerificationPage );
