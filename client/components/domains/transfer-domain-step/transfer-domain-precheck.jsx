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

			if ( result.unlocked ) {
				this.showNextStep();
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

	getSection( heading, message, buttonText, step, lockStatus ) {
		const { currentStep, loading, unlocked } = this.state;
		const isAtCurrentStep = step === currentStep;
		const isStepFinished = currentStep > step;
		const sectionClasses = classNames( 'transfer-domain-step__section', {
			'is-expanded': isAtCurrentStep,
			'is-complete': isStepFinished,
		} );

		const sectionIcon = isStepFinished ? <Gridicon icon="checkmark-circle" size={ 36 } /> : step;

		return (
			<Card compact>
				<div className={ sectionClasses }>
					<span className="transfer-domain-step__section-heading-number">{ sectionIcon }</span>
					<div className="transfer-domain-step__section-text">
						<div className="transfer-domain-step__section-heading">
							<strong>{ heading }</strong>
							{ lockStatus }
						</div>
						{ isAtCurrentStep && (
							<div>
								<div className="transfer-domain-step__section-message">{ message }</div>
								<Button
									compact
									onClick={ unlocked ? this.showNextStep : this.refreshStatus }
									disabled={ loading }
								>
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
		const { unlocked, loading } = this.state;

		const heading = unlocked
			? translate( 'Domain is unlocked.' )
			: translate( 'Unlock the domain.' );
		const message = unlocked
			? translate( 'Your domain is unlocked at your current registrar.' )
			: translate(
					"Your domain is locked to prevent unauthorized transfers. You'll need to unlock " +
						'it at your current domiain provider before we can move it. {{a}}Here are instructions for unlocking it{{/a}}',
					{
						components: {
							a: <a href="#" rel="noopener noreferrer" />,
						},
					}
				);
		const buttonText = loading ? translate( 'Checking…' ) : translate( "I've unlocked my domain" );

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
				"you have access to that address. Don't recognize it? Then you have privacy protection enabled. " +
				"You'll need to log in to your current domain provider and {{a}}turn it off{{/a}} before we start. " +
				"Don't worry, you can re-enable it once the transfer is done.",
			{
				args: { email },
				components: {
					strong: <strong className="transfer-domain-step__admin-email" />,
					a: <a href="#" rel="noopener noreferrer" />,
				},
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
				'but it might be called a secret code, auth code, or EPP code. {{a}}Learn more{{/a}}.',
			{
				components: {
					a: <a href="#" rel="noopener noreferrer" />,
				},
			}
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
				<img
					className="transfer-domain-step__illustration"
					src={ '/calypso/images/illustrations/migrating-host-diy.svg' }
				/>
			</Card>
		);
	}

	render() {
		const { translate } = this.props;
		const { unlocked, currentStep } = this.state;

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
								'Note: These changes can take some time to take effect. ' +
									'Need help? {{a}}Get in touch with one of our Happiness Engineers{{/a}}.',
								{
									components: {
										a: <a href={ support.CALYPSO_CONTACT } rel="noopener noreferrer" />,
									},
								}
							) }
						</p>
					</div>
					<Button
						disabled={ ! unlocked || currentStep < 4 }
						onClick={ this.onClick }
						primary={ true }
					>
						{ translate( 'Continue' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( TransferDomainPrecheck );
