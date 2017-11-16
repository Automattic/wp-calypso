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
import FoldableCard from 'components/foldable-card';
import Card from 'components/card';
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

	getSection( heading, message, explanation, position, button ) {
		const header = (
			<div className="transfer-domain-step__section">
				<span className="transfer-domain-step__section-heading-number">{ position }</span>
				<div>
					<strong className="transfer-domain-step__section-heading">{ heading }</strong>
					<div className="transfer-domain-step__section-message">{ message }</div>
				</div>
			</div>
		);

		const cardClasses = classNames( {
			'hide-secondary': ! button,
		} );

		return (
			<FoldableCard
				className={ cardClasses }
				header={ header }
				summary={ button }
				expandedSummary={ button }
			>
				<div className="transfer-domain-step__section-explanation">{ explanation }</div>
			</FoldableCard>
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
					"You'll need to unlock the domain at your current registrar before we can move it."
				);
		const explanation = translate(
			'Your current domain provider has locked the domain to prevent unauthorized transfers.'
		);

		const button = unlocked ? (
			<div className="transfer-domain-step__unlocked">
				<Gridicon icon="checkmark" size={ 12 } />
				<span>{ translate( 'Unlocked' ) }</span>
			</div>
		) : (
			<Button disabled={ this.state.loading } onClick={ this.refreshStatus }>
				{ translate( 'Check Again' ) }
			</Button>
		);

		return this.getSection( heading, message, explanation, 1, button );
	}

	getPrivacyMessage() {
		const { translate } = this.props;
		const { email, privacy } = this.state;

		const heading = privacy
			? translate( 'Disable privacy protection.' )
			: translate( 'Privacy protection is disabled.' );
		const message = privacy
			? translate(
					"We'll send an email to {{strong}}%(email)s{{/strong}} to start the transfer process. Don't recognize " +
						"that address? Then you have privacy protection, and you'll need to turn it off before we start.",
					{
						args: { email },
						components: { strong: <strong /> },
					}
				)
			: translate(
					"We'll send an email to {{strong}}%(email)s{{/strong}} to start the transfer process. After the transfer " +
						'is complete you can enable privacy to hide your registration information again.',
					{
						args: { email },
						components: { strong: <strong /> },
					}
				);
		const explanation = translate(
			"It's important that we are able to reach you, because the transfer involves few emails. Privacy protection is great, " +
				'but means that your contact information is hidden. To continue with the transfer, turn privacy protection off for now ' +
				'- you can re-enable it once the transfer is done.'
		);

		return this.getSection( heading, message, explanation, 2 );
	}

	getEppMessage() {
		const { translate } = this.props;

		const heading = translate( 'Get a domain authorization code.' );
		const message = translate(
			"You'll need this code to okay the transfer. " +
				"We'll send you and email with a link to the place where you'll need to enter it."
		);
		const explanation = translate(
			'A domain authorization code is a unique code linked only to your domain - kind of like a ' +
				'password for your domain. Log in to your current domain provider to get one. ' +
				"We call it a domain authorization code, but it's also called a secret code, auth code or EPP code."
		);

		return this.getSection( heading, message, explanation, 3 );
	}

	render() {
		const { translate } = this.props;
		const headerLabel = translate(
			"Let's get your domain ready to transfer. " +
				'Log into your current registrar to complete a few preliminary steps.'
		);

		return (
			<div className="transfer-domain-step__precheck">
				<Card compact={ true }>{ headerLabel }</Card>
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
