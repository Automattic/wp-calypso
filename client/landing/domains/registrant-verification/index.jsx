import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';
import wp from 'calypso/lib/wp';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import DomainsLandingContentCard from '../content-card';
import DomainsLandingHeader from '../header';
import { getMaintenanceMessageFromError } from '../utils';

class RegistrantVerificationPage extends Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		token: PropTypes.string.isRequired,
	};

	state = this.getLoadingState();

	componentDidMount() {
		const { domain, email, token } = this.props;
		wp.req
			.get( `/domains/${ domain }/verify-email`, { email, token } )
			.then( ( response ) => {
				this.setState( this.getVerificationSuccessState( get( response, 'domains', [ domain ] ) ) );
			} )
			.catch( ( error ) => {
				this.setErrorState( error );
			} );
	}

	getLoadingState() {
		const { translate } = this.props;
		return {
			isLoading: true,
			title: translate( 'Verifying your contact information…' ),
			message: 'Loading…',
			actionTitle: null,
			actionCallback: null,
			footer: 'Loading…',
		};
	}

	getVerificationSuccessState = ( domains ) => {
		const { translate } = this.props;

		const DomainLinks = domains.map( ( domain, index ) => [
			index > 0 && ', ',
			<a key={ domain } href={ `https://${ domain }?logmein=1` }>
				{ domain }
			</a>,
		] );

		return {
			title: translate( 'Success!' ),
			message: translate(
				'Thank your for verifying your contact information for:{{br /}}{{strong}}{{domainLinks /}}{{/strong}}.',
				{
					components: {
						domainLinks: DomainLinks,
						strong: <strong />,
						br: <br />,
					},
				}
			),
			actionTitle: null,
			actionCallback: null,
			footer: translate(
				'All done. You can close this window now or {{domainsManagementLink}}manage your domains{{/domainsManagementLink}}.',
				{
					components: {
						domainsManagementLink: <a href={ domainManagementRoot() } />,
					},
				}
			),
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
					"You've already verified {{strong}}%(email)s{{/strong}} for:{{br /}}{{strong}}{{a}}%(domain)s{{/a}}{{/strong}}.",
					{
						args: {
							email: email,
							domain: domain,
						},
						components: {
							strong: <strong />,
							br: <br />,
							a: <a href={ `https://${ domain }?logmein=1` } />,
						},
					}
				),
				footer: translate(
					'All done. You can close this window now or {{domainsManagementLink}}manage your domains{{/domainsManagementLink}}.',
					{
						components: {
							domainsManagementLink: <a href={ domainManagementRoot() } />,
						},
					}
				),
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
			case 'KS_RSP_error':
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

		wp.req
			.post( `/domains/${ domain }/resend-icann` )
			.then( () => {
				this.setState( {
					title: translate( 'Email sent!' ),
					message: translate( 'Check your email.' ),
					actionTitle: null,
					actionCallback: null,
					footer: translate( "That's all for now. We'll see you again soon." ),
					isLoading: false,
				} );
			} )
			.catch( () => {
				this.setErrorState( { error: 'resend_email_failed' } );
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
