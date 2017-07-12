/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import support from 'lib/url/support';
import Button from 'components/button';
import Card from 'components/card';
import upgradesActions from 'lib/upgrades/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { domainManagementEditContactInfo } from 'my-sites/domains/paths';
import { getRegistrantWhois } from 'state/selectors';
import QueryWhois from 'components/data/query-whois';

class IcannVerificationCard extends React.Component {
	static propTypes = {
		explanationContext: React.PropTypes.string,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSiteSlug: React.PropTypes.string.isRequired,
		contactDetails: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
	};

	state = {
		submitting: false,
		emailSent: false,
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		this.setState( { submitting: true } );

		upgradesActions.resendIcannVerification( this.props.selectedDomainName, ( error ) => {
			if ( error ) {
				this.props.errorNotice( error.message );
			} else {
				this.setState( { emailSent: true } );
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
			'you concerning your domain. Please verify your email address or your domain will stop working. ' +
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

	renderStatus() {
		const { translate, selectedDomainName, selectedSiteSlug } = this.props;
		const changeEmailHref = domainManagementEditContactInfo( selectedSiteSlug, selectedDomainName );

		const { emailSent, submitting } = this.state;
		const statusClassNames = classNames( 'icann-verification__status-container', {
			waiting: ! emailSent,
			sent: emailSent,
		} );
		let statusIcon = 'notice-outline';
		let statusText = translate( 'Check your email — verfication sent to %(email)s.', {
			args: { email: this.props.contactDetails.email },
		} );
		if ( emailSent ) {
			statusIcon = 'mail';
			statusText = translate( 'Sent to %(email)s. Check your email to verify.', {
				args: { email: this.props.contactDetails.email },
			} );
		}

		return (
			<div className={ statusClassNames }>
				<div className="icann-verification__status">
					<Gridicon icon={ statusIcon } size={ 36 } />
					{ statusText }

					{ ! emailSent &&
						<div>
							<Button
								compact
								busy={ submitting }
								disabled={ submitting }
								onClick={ this.handleSubmit }>
								{ submitting ? translate( 'Sending…' ) : translate( 'Send Again' ) }
							</Button>

							<Button
								compact
								href={ changeEmailHref }
								onClick={ this.props.onClick }>
								{ this.props.translate( 'Change Email Address' ) }
							</Button>
						</div>
					}
				</div>

			</div>
		);
	}

	render() {
		const { selectedDomainName } = this.props;

		if ( ! this.props.contactDetails ) {
			return <QueryWhois domain={ selectedDomainName } />;
		}

		return (
			<Card compact highlight="warning" className="icann-verification__card">
				<QueryWhois domain={ selectedDomainName } />
				<div className="icann-verification__explanation">
					<h1 className="icann-verification__heading">Important: Verify Your Email Address</h1>
					{ this.getExplanation() }
				</div>

				{ this.renderStatus() }
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		contactDetails: getRegistrantWhois( state, ownProps.selectedDomainName ),
	} ),
	dispatch => bindActionCreators( { errorNotice, successNotice }, dispatch )
)( localize( IcannVerificationCard ) );
