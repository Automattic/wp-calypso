/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { recordTracksEvent } from 'state/analytics/actions';
import FormattedHeader from 'components/formatted-header';
import { checkInboundTransferStatus } from 'lib/domains';
import support from 'lib/url/support';

class TransferDomainPrecheck extends React.PureComponent {
	static propTypes = {
		domain: PropTypes.string,
		setValid: PropTypes.func,
		supportsPrivacy: PropTypes.bool,
	};

	state = {
		unlocked: false,
		privacy: false,
		email: '',
		loading: true,
		losingRegistrar: '',
		losingRegistrarIanaId: '',
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
		const { domain, supportsPrivacy } = this.props;
		const { losingRegistrar, losingRegistrarIanaId } = this.state;

		this.props.recordContinueButtonClick( domain, losingRegistrar, losingRegistrarIanaId );

		this.props.setValid( domain, supportsPrivacy );
	};

	refreshStatus = ( proceedToNextStep = true ) => {
		this.setState( { loading: true } );

		checkInboundTransferStatus( this.props.domain, ( error, result ) => {
			if ( ! isEmpty( error ) ) {
				return;
			}

			if ( proceedToNextStep && result.unlocked ) {
				this.showNextStep();
			}

			// Reset steps if domain became locked again
			if ( ! result.unlocked ) {
				this.resetSteps();
			}

			this.setState( {
				email: result.admin_email,
				privacy: result.privacy,
				unlocked: result.unlocked,
				loading: false,
				losingRegistrar: result.registrar,
				losingRegistrarIanaId: result.registrar_iana_id,
			} );
		} );
	};

	refreshStatusOnly = () => {
		this.refreshStatus( false );
	};

	resetSteps = () => {
		if ( this.state.currentStep !== 1 ) {
			this.setState( { currentStep: 1 } );
		}
	};

	showNextStep = () => {
		this.props.recordNextStep( this.props.domain, this.state.currentStep + 1 );
		this.setState( { currentStep: this.state.currentStep + 1 } );
	};

	getSection( heading, message, buttonText, step, stepStatus ) {
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
							{ isStepFinished && stepStatus }
						</div>
						{ isAtCurrentStep && (
							<div>
								<div className="transfer-domain-step__section-message">{ message }</div>
								<div className="transfer-domain-step__section-action">
									<Button
										compact
										onClick={ unlocked ? this.showNextStep : this.refreshStatus }
										busy={ loading }
									>
										{ buttonText }
									</Button>
									{ stepStatus }
								</div>
							</div>
						) }
					</div>
				</div>
			</Card>
		);
	}

	getStatusMessage() {
		const { translate } = this.props;
		const { currentStep, unlocked, loading } = this.state;
		const step = 1;
		const isStepFinished = currentStep > step;

		const heading = unlocked
			? translate( 'Domain is unlocked.' )
			: translate( 'Unlock the domain.' );
		const message = unlocked
			? translate( 'Your domain is unlocked at your current registrar.' )
			: translate(
					"Your domain is locked to prevent unauthorized transfers. You'll need to unlock " +
						'it at your current domain provider before we can move it. {{a}}Here are instructions for unlocking it{{/a}}. ' +
						'It might take a few minutes for any changes to take effect.',
					{
						components: {
							a: (
								<a
									href={ support.INCOMING_DOMAIN_TRANSFER_PREPARE_UNLOCK }
									rel="noopener noreferrer"
									target="_blank"
								/>
							),
						},
					}
				);
		const buttonText = translate( "I've unlocked my domain" );

		let lockStatusClasses = unlocked
			? 'transfer-domain-step__lock-status transfer-domain-step__unlocked'
			: 'transfer-domain-step__lock-status transfer-domain-step__locked';

		let lockStatusIcon = unlocked ? 'checkmark' : 'cross';
		let lockStatusText = unlocked ? translate( 'Unlocked' ) : translate( 'Locked' );

		if ( loading && ! isStepFinished ) {
			lockStatusClasses = 'transfer-domain-step__lock-status transfer-domain-step__checking';
			lockStatusIcon = 'sync';
			lockStatusText = 'Checking…';
		}

		const lockStatus = (
			<div className={ lockStatusClasses }>
				<Gridicon icon={ lockStatusIcon } size={ 12 } />
				<span>{ lockStatusText }</span>
			</div>
		);

		return this.getSection( heading, message, buttonText, step, lockStatus );
	}

	getPrivacyMessage() {
		const { translate } = this.props;
		const { currentStep, email, loading } = this.state;
		const step = 2;
		const isStepFinished = currentStep > step;

		const heading = translate( 'Verify we can get in touch.' );
		let message = translate(
			"Make sure you have access to the email address on your domain's contact information with privacy " +
				"protection turned off. We couldn't get the email address on file and we need to send an important " +
				'email to start the transfer process.' +
				'{{br/}}{{br/}}' +
				'Log in to your current domain provider to check your contact information and make sure privacy ' +
				"is disabled. {{a}}Here's how to do that{{/a}}. Don't worry, you can turn it on once the transfer is done.",
			{
				components: {
					br: <br />,
					a: (
						<a
							href={ support.INCOMING_DOMAIN_TRANSFER_PREPARE_PRIVACY }
							rel="noopener noreferrer"
							target="_blank"
						/>
					),
				},
			}
		);
		let buttonText = translate( 'I can access the email address' );

		if ( email ) {
			message = translate(
				"Make sure you have access to the email address on your domain's contact information with privacy " +
					"protection turned off. We'll send an email to {{strong}}%(email)s{{/strong}} to start the " +
					"transfer process. Don't recognize that address? Then you might have privacy protection enabled." +
					'{{br/}}{{br/}}' +
					'Log in to your current domain provider to check your contact information and make sure privacy ' +
					"is disabled. {{a}}Here's how to do that{{/a}}. Don't worry, you can turn it on once the transfer is done.",
				{
					args: { email },
					components: {
						strong: <strong className="transfer-domain-step__admin-email" />,
						br: <br />,
						a: (
							<a
								href={ support.INCOMING_DOMAIN_TRANSFER_PREPARE_PRIVACY }
								rel="noopener noreferrer"
								target="_blank"
							/>
						),
					},
				}
			);

			buttonText = translate( 'I can access this email address' );
		}

		const statusClasses = loading
			? 'transfer-domain-step__lock-status transfer-domain-step__checking'
			: 'transfer-domain-step__lock-status transfer-domain-step__refresh';
		const statusIcon = 'sync';
		const statusText = loading ? translate( 'Checking…' ) : translate( 'Refresh email address' );

		const stepStatus = ! isStepFinished && (
			<a className={ statusClasses } onClick={ this.refreshStatusOnly }>
				<Gridicon icon={ statusIcon } size={ 12 } />
				<span>{ statusText }</span>
			</a>
		);

		return this.getSection( heading, message, buttonText, step, stepStatus );
	}

	getEppMessage() {
		const { translate } = this.props;

		const heading = translate( 'Get a domain authorization code.' );
		const message = translate(
			'A domain authorization code is a unique code linked only to your domain — kind of like a ' +
				"password for your domain. Log in to your current domain provider to get one. We'll send you an email " +
				'with a link to enter it and officially okay the transfer. We call it a domain authorization code, ' +
				'but it might be called a secret code, auth code, or EPP code. {{a}}Learn more{{/a}}.',
			{
				components: {
					a: (
						<a
							href={ support.INCOMING_DOMAIN_TRANSFER_PREPARE_AUTH_CODE }
							rel="noopener noreferrer"
							target="_blank"
						/>
					),
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
						'Log into your current domain provider to complete a few preliminary steps.'
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
										a: (
											<a
												href={ support.CALYPSO_CONTACT }
												rel="noopener noreferrer"
												target="_blank"
											/>
										),
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

const recordNextStep = ( domain_name, show_step ) =>
	recordTracksEvent( 'calypso_transfer_domain_precheck_step_change', { domain_name, show_step } );

const recordContinueButtonClick = ( domain_name, losing_registrar, losing_registrar_iana_id ) =>
	recordTracksEvent( 'calypso_transfer_domain_precheck_continue_click', {
		domain_name,
		losing_registrar,
		losing_registrar_iana_id,
	} );

export default connect( null, {
	recordNextStep,
	recordContinueButtonClick,
} )( localize( TransferDomainPrecheck ) );
