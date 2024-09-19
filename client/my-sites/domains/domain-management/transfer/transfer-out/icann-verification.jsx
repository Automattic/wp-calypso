import { Card, Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { TRANSFER_DOMAIN_REGISTRATION } from '@automattic/urls';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import { verifyIcannEmail } from 'calypso/state/domains/management/actions';

class IcannVerification extends Component {
	state = {
		submitting: false,
	};

	handleClick = async () => {
		this.setState( { submitting: true } );

		await this.props.verifyIcannEmail( this.props.selectedDomainName );

		this.setState( { submitting: false } );
	};

	render() {
		const { translate } = this.props;

		return (
			<div>
				<Card className="transfer-out__card">
					<p>
						{ translate(
							'You must verify your email address before you can transfer this domain. ' +
								'{{learnMoreLink}}Learn more.{{/learnMoreLink}}',
							{
								components: {
									learnMoreLink: (
										<a
											href={ localizeUrl( TRANSFER_DOMAIN_REGISTRATION ) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
					<Button
						className="transfer-out__action-button"
						onClick={ this.handleClick }
						disabled={ this.state.submitting }
						primary
					>
						{ translate( 'Resend Verification Email' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default connect( null, {
	verifyIcannEmail,
} )( localize( IcannVerification ) );
