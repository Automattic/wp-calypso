/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import support from 'lib/url/support';
import Button from 'components/button';
import Card from 'components/card';
import upgradesActions from 'lib/upgrades/actions';
import { errorNotice, successNotice } from 'state/notices/actions';

class IcannVerificationCard extends React.Component {
	static propTypes = {
		explanationContext: React.PropTypes.string,
		selectedDomainName: React.PropTypes.string.isRequired,
	};

	state = {
		submitting: false,
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		this.setState( { submitting: true } );

		upgradesActions.resendIcannVerification( this.props.selectedDomainName, ( error ) => {
			if ( error ) {
				this.props.errorNotice( error.message );
			} else {
				this.props.successNotice( this.props.translate(
					'Email sent to [registrant contact email]. Check your email.'
				) );
			}

			this.setState( { submitting: false } );
		} );
	};

	getExplanation() {
		const { translate, explanationContext } = this.props;
		if ( explanationContext === 'name-servers' ) {
			return translate(
				'You have to verify the email address used to register this domain before you ' +
				'are able to update the name servers for your domain. ' +
				'Look for the verification message in your email inbox.'
			);
		}

		return translate(
			'We need to verify the email address you provided for this domain to ensure we can contact ' +
			'you concerning your domain. Please verify your email address or your domain may be suspended. ' +
			'{{learnMoreLink}}Learn more.{{/learnMoreLink}}', {
				components: {
					learnMoreLink: <a href={ support.EMAIL_VALIDATION_AND_VERIFICATION }
						target="_blank"
						rel="noopener noreferrer"
					/>
				}
			}
		);
	}

	render() {
		const { translate } = this.props;
		return (
			<Card compact highlight="warning" className="icann-verification__card">
				<div className="icann-verification__explanation">
					<h1 className="icann-verification__heading">Important: Verify Your Email Address</h1>
					{ this.getExplanation() }
				</div>

				<div className="icann-verification__status-container">
					<div className="icann-verification__status waiting">
						<Gridicon icon="notice-outline" size={ 36 } />
						{ translate(
							'Check your email — we\'re waiting for you to verify.'
						)}
					</div>

					<Button
						primary
						disabled={ this.state.submitting }
						onClick={ this.handleSubmit }>
						{ translate( 'Send Again' ) }
					</Button>

					<div className="icann-verification__sent-to">
						{ translate(
							'Sent to registrant@contactemail.com. ' +
							'{{registrantEmail}}Change email address.{{/registrantEmail}}', {
								components: {
									registrantEmail: <a href="#" />
								}
							}
						)}
					</div>
				</div>
			</Card>
		);
	}
}

export default connect(
	null,
	dispatch => bindActionCreators( { errorNotice, successNotice }, dispatch )
)( localize( IcannVerificationCard ) );
