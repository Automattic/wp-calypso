/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import support from 'lib/url/support';
import Button from 'components/button';
import Card from 'components/card';
import upgradesActions from 'lib/upgrades/actions';
import { errorNotice } from 'state/notices/actions';
import { domainManagementEditContactInfo } from 'my-sites/domains/paths';
import { getRegistrantWhois } from 'state/selectors';
import QueryWhois from 'components/data/query-whois';

class IcannVerificationCard extends React.Component {
	static propTypes = {
		contactDetails: PropTypes.object,
		explanationContext: PropTypes.string,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	state = {
		submitting: false,
		emailSent: false,
	};

	componentWillUnmount() {
		if ( this.timer ) {
			clearTimeout( this.timer );
			this.timer = null;
		}
	}

	revertToWaitingState = () => {
		this.timer = null;
		this.setState( { emailSent: false } );
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		this.setState( { submitting: true } );

		upgradesActions.resendIcannVerification( this.props.selectedDomainName, ( error ) => {
			if ( error ) {
				this.props.errorNotice( error.message );
			} else {
				this.timer = setTimeout( this.revertToWaitingState, 5000 );
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
			'We need to check your contact information to make sure you can be reached. Please verify your ' +
			'details using the email we sent you, or your domain will stop working. ' +
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
		let statusText = translate( 'Check your email — instructions sent to %(email)s.', {
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
	{ errorNotice }
)( localize( IcannVerificationCard ) );
