/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { checkInboundTransferStatus } from 'lib/domains';

class TransferDomainPrecheck extends React.PureComponent {
	static propTypes = {
		total: PropTypes.number,
		current: PropTypes.number,
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

	getSection( icon, heading, message ) {
		return (
			<p>
				{ icon }
				<span>{ heading }</span>
				{ message }
			</p>
		);
	}

	getStatusMessage() {
		const { translate } = this.props;
		const { unlocked } = this.state;

		const icon = unlocked ? (
			<Gridicon icon="checkmark-circle" />
		) : (
			<Gridicon icon="notice-outline" />
		);
		const heading = unlocked
			? translate( 'Domain is unlocked.' )
			: translate( 'Unlock the domain.' );
		const message = unlocked
			? translate( 'Your domain is unlocked at your current registrar.' )
			: translate( 'Please unlock the domain at your current registrar so you can transfer it.' );

		return this.getSection( icon, heading, message );
	}

	getPrivacyMessage() {
		const { translate } = this.props;
		const { email, privacy } = this.state;

		const icon = privacy ? (
			<Gridicon icon="checkmark-circle" />
		) : (
			<Gridicon icon="notice-outline" />
		);
		const heading = privacy
			? translate( 'Whois privacy is disabled.' )
			: translate( 'Disable Whois privacy.' );
		const message = privacy
			? translate(
					"We'll send an important email to %(email)s to start the domain transfer. If you don't recognize" +
						'this email address you might need to disable Whois privacy to make sure you receive it. After the transfer' +
						'is complete you can make your registration information private again.',
					{
						args: { email },
					}
				)
			: translate(
					"We'll send an important email to %(email)s to start the domain transfer. After the transfer" +
						'is complete you can enable privacy to hide your registration information again.',
					{
						args: { email },
					}
				);

		return this.getSection( icon, heading, message );
	}

	getEppMessage() {
		const { translate } = this.props;

		const icon = <Gridicon icon="info" />;
		const heading = translate( 'Get domain authorization code.' );
		const message = translate(
			'Get an authorization code from your current registrar. This is sometimes ' +
				'called a secret code, EPP code, or auth code. You will need it to initiate the transfer.'
		);

		return this.getSection( icon, heading, message );
	}

	render() {
		const { current, domain, total, translate } = this.props;

		let headerLabel = translate( 'Prepare Domain' );
		if ( total > 1 ) {
			headerLabel = translate( 'Prepare Domain %(current)s of %(total)s: %(domain)s', {
				args: {
					current: current + 1,
					total,
					domain,
				},
			} );
		}

		return (
			<div className="checkout__transfer-domain-precheck">
				<SectionHeader label={ headerLabel }>
					<Button disabled={ this.state.loading } onClick={ this.refreshStatus }>
						{ translate( 'Refresh Status' ) }
					</Button>
				</SectionHeader>
				<Card>
					<p>
						{ translate(
							'Log in to your current registrar and complete these steps to prepare your domain for transfer. ' +
								'Changes can take up to X minutes to update. {{a}}Need Help?{{/a}}',
							{
								components: {
									a: <a href="#" />,
								},
							}
						) }
					</p>
					{ this.getStatusMessage() }
					{ this.getPrivacyMessage() }
					{ this.getEppMessage() }
					<Button disabled={ ! this.state.unlocked } onClick={ this.onClick }>
						{ translate( 'Continue' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( TransferDomainPrecheck );
