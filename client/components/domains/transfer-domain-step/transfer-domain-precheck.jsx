/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import { checkInboundTransferStatus } from 'lib/domains';
import support from 'lib/url/support';

class TransferDomainPrecheck extends React.PureComponent {
	static propTypes = {
		domain: PropTypes.string,
		setValid: PropTypes.func,
	};

	state = {
		unlocked: false,
		privacy: false,
		email: '',
		loading: true,
		currentStep: 1,
	};

	componentWillMount() {
		this.refreshStatus();
	}

	componentWillUpdate( nextProps ) {
		if ( nextProps.domain !== this.props.domain ) {
			this.refreshStatus();
		}
	}

	onClick = () => {
		this.props.setValid( this.props.domain );
	};

	refreshStatus = () => {
		this.setState( { loading: true } );

		checkInboundTransferStatus( this.props.domain, ( error, result ) => {
			if ( ! isEmpty( error ) ) {
				return;
			}

			this.setState( {
				email: result.admin_email,
				privacy: result.privacy,
				unlocked: result.unlocked,
				loading: false,
			} );
		} );
	};

	showNextStep = () => {
		this.setState( { currentStep: this.state.currentStep + 1 } );
	};

	getSection( heading, message, buttonText, position, lockStatus ) {
		const { currentStep } = this.state;
		const sectionClasses = classNames( 'transfer-domain-step__section', {
			'is-expanded': position === currentStep,
			'is-complete': position < currentStep,
		} );

		const sectionIcon =
			currentStep > position ? <Gridicon icon="checkmark-circle" size={ 36 } /> : position;

		return (
			<Card compact>
				<div className={ sectionClasses }>
					<span className="transfer-domain-step__section-heading-number">{ sectionIcon }</span>
					<div className="transfer-domain-step__section-text">
						<div className="transfer-domain-step__section-heading">
							<strong>{ heading }</strong>
							{ lockStatus }
						</div>
						{ position === currentStep && (
							<div>
								<div className="transfer-domain-step__section-message">{ message }</div>
								<Button compact onClick={ this.showNextStep }>
									{ buttonText }
								</Button>
							</div>
						) }
					</div>
				</div>
			</Card>
		);
	}

	getStatusMessage() {
		const { translate } = this.props;
		const { unlocked } = this.state;

		const heading = unlocked
			? translate( 'Domain is unlocked.' )
			: translate( 'Unlock the domain.' );
		const message = unlocked
			? translate( 'Your domain is unlocked at your current registrar.' )
			: translate(
					"Your domain is locked to prevent unauthorized transfers. You'll need to unlock " +
						'it before we can move it.'
				);
		const buttonText = translate( "I've unlocked my domain" );

		const lockStatus = unlocked ? (
			<div className="transfer-domain-step__lock-status transfer-domain-step__unlocked">
				<Gridicon icon="checkmark" size={ 12 } />
				<span>{ translate( 'Unlocked' ) }</span>
			</div>
		) : (
			<div className="transfer-domain-step__lock-status transfer-domain-step__locked">
				<Gridicon icon="cross" size={ 12 } />
				<span>{ translate( 'Locked' ) }</span>
			</div>
		);

		return this.getSection( heading, message, buttonText, 1, lockStatus );
	}

	getPrivacyMessage() {
		const { translate } = this.props;
		const { email } = this.state;

		const heading = translate( 'Verify we can get in touch.' );
		const message = translate(
			"We'll send an email to {{strong}}%(email)s{{/strong}} to start the transfer process. Make sure " +
				"you have access to that address. Don't recognize it? Then you have privacy protection, " +
				"and you'll need to turn it off before we start.",
			{
				args: { email },
				components: { strong: <strong /> },
			}
		);
		const buttonText = translate( 'I can access this email address' );

		return this.getSection( heading, message, buttonText, 2 );
	}

	getEppMessage() {
		const { translate } = this.props;

		const heading = translate( 'Get a domain authorization code.' );
		const message = translate(
			'A domain authorization code is a unique code linked only to your domain — kind of like a ' +
				"password for your domain. Log in to your current registrar to get one. We'll send you an email " +
				'with a link to enter it and officially okay the transfer. We call it a domain authorization code, ' +
				'but it might be called a secret code, auth code, or EPP code.'
		);
		const buttonText = translate( 'I have my authorization code' );

		return this.getSection( heading, message, buttonText, 3 );
	}

	getHeader() {
		const { translate, domain } = this.props;

		return (
			<Card compact={ true } className="transfer-domain-step__title">
				<FormattedHeader
					headerText={ translate( "Let's get {{strong}}%(domain)s{{/strong}} ready to transfer.", {
						args: { domain },
						components: { strong: <strong /> },
					} ) }
					subHeaderText={ translate(
						'Log into your current registrar to complete a few preliminary steps.'
					) }
				/>
			</Card>
		);
	}

	render() {
		const { translate } = this.props;

		return (
			<div className="transfer-domain-step__precheck">
				{ this.getHeader() }
				{ this.getStatusMessage() }
				{ this.getPrivacyMessage() }
				{ this.getEppMessage() }
				<Card className="transfer-domain-step__continue">
					<div className="transfer-domain-step__continue-text">
						<p>
							{ translate(
								'Note: These changes can take up to 20 minutes to take effect. ' +
									'Need help? {{a}}Get in touch with one of our Happiness Engineers{{/a}}.',
								{
									components: {
										a: <a href={ support.CALYPSO_CONTACT } rel="noopener noreferrer" />,
									},
								}
							) }
						</p>
					</div>
					<Button disabled={ ! this.state.unlocked } onClick={ this.onClick } primary={ true }>
						{ translate( 'Continue' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( TransferDomainPrecheck );
