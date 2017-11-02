/**
 * External dependencies
 *
 * @format
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
import SectionHeader from 'components/section-header';
import { checkInboundTransferStatus } from 'lib/domains';

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
				privacy: false,
				unlocked: result.unlocked,
				loading: false,
			} );
		} );
	};

	getSection( heading, message, explanation, position, button ) {
		const header = (
			<div>
				<div className="transfer-domain-step__section-heading">
					<span className="transfer-domain-step__section-heading-number">{ position }</span>
					{ heading }
				</div>
				<div>
					<small>{ message }</small>
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
				{ explanation }
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
			: translate( 'Please unlock the domain at your current registrar so you can transfer it.' );
		const explanation = translate(
			'Your current domain provider has locked the domain to prevent unauthorized transfers.'
		);

		const button = unlocked ? (
			<div className="transfer-domain-step__unlocked">
				<Gridicon icon="checkmark" size={ 12 } />
				<span>Unlocked</span>
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
			? translate( 'Privacy protection is disabled.' )
			: translate( 'Disable privacy protection.' );
		const message = privacy
			? translate(
					"We'll send an important email to {{strong}}%(email)s{{/strong}} to start the domain transfer. If you don't recognize" +
						'this email address you might need to disable Whois privacy to make sure you receive it. After the transfer' +
						'is complete you can make your registration information private again.',
					{
						args: { email },
						components: { strong: <strong /> },
					}
				)
			: translate(
					"We'll send an important email to {{strong}}%(email)s{{/strong}} to start the domain transfer. After the transfer" +
						'is complete you can enable privacy to hide your registration information again.',
					{
						args: { email },
						components: { strong: <strong /> },
					}
				);
		const explanation = translate(
			"We need to make sure we can reach you as the owner of the domain. If you don't " +
				'recognize the e-mail address you might need to disable privacy protection at your current domain provider. ' +
				'After the transfer is complete you can make your registration information private again.'
		);

		return this.getSection( heading, message, explanation, 2 );
	}

	getEppMessage() {
		const { translate } = this.props;

		const heading = translate( 'Write down domain authorization code.' );
		const message = translate(
			'Get an authorization code from your current registrar. We will e-mail you a link to enter it ' +
				'so we can start the transfer process.'
		);
		const explanation = translate(
			'Log in to your current domain provider and get the domain authorization code to use later. This is a special ' +
				'code linked to the domain like a password. It allows you to authorize the transfer of the domain. ' +
				'This is also sometimes called a secret code, EPP code, or auth code.'
		);

		return this.getSection( heading, message, explanation, 3 );
	}

	render() {
		const { translate } = this.props;
		const headerLabel = translate(
			'Log in to your current registrar and complete these steps to prepare your domain for transfer. ' +
				'Changes can take up to X minutes to update. {{a}}Need Help?{{/a}}',
			{
				components: {
					a: <a href="#" />,
				},
			}
		);
		return (
			<div className="transfer-domain-step__precheck">
				<SectionHeader>{ headerLabel }</SectionHeader>
				{ this.getStatusMessage() }
				{ this.getPrivacyMessage() }
				{ this.getEppMessage() }
				<div className="transfer-domain-step__continue">
					<Button disabled={ ! this.state.unlocked } onClick={ this.onClick }>
						{ translate( 'Continue' ) }
					</Button>
				</div>
			</div>
		);
	}
}

export default localize( TransferDomainPrecheck );
