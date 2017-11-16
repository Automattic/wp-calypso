/**
 * External dependencies
 *
 * @format
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
import Button from 'components/button';
import Card from 'components/card';
import { errorNotice } from 'state/notices/actions';
import { getRegistrantWhois } from 'state/selectors';
import QueryWhois from 'components/data/query-whois';

class EmailVerificationCard extends React.Component {
	static propTypes = {
		changeEmailHref: PropTypes.string,
		contactDetails: PropTypes.object,
		verificationExplanation: PropTypes.array.isRequired,
		resendVerification: PropTypes.func.isRequired,
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

	handleSubmit = event => {
		const { resendVerification, selectedDomainName } = this.props;

		event.preventDefault();

		this.setState( { submitting: true } );

		resendVerification( selectedDomainName, error => {
			if ( error ) {
				this.props.errorNotice( error.message );
			} else {
				this.timer = setTimeout( this.revertToWaitingState, 5000 );
				this.setState( { emailSent: true } );
			}

			this.setState( { submitting: false } );
		} );
	};

	renderStatus() {
		const { changeEmailHref, translate } = this.props;
		const { emailSent, submitting } = this.state;
		const statusClassNames = classNames( 'email-verification__status-container', {
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
				<div className="email-verification__status">
					<Gridicon icon={ statusIcon } size={ 36 } />
					{ statusText }

					{ ! emailSent && (
						<div>
							<Button
								compact
								busy={ submitting }
								disabled={ submitting }
								onClick={ this.handleSubmit }
							>
								{ submitting ? translate( 'Sending…' ) : translate( 'Send Again' ) }
							</Button>

							{ changeEmailHref && (
								<Button compact href={ changeEmailHref } onClick={ this.props.onClick }>
									{ this.props.translate( 'Change Email Address' ) }
								</Button>
							) }
						</div>
					) }
				</div>
			</div>
		);
	}

	render() {
		const { verificationExplanation, selectedDomainName } = this.props;

		if ( ! this.props.contactDetails ) {
			return <QueryWhois domain={ selectedDomainName } />;
		}

		return (
			<Card highlight="warning" className="email-verification">
				<QueryWhois domain={ selectedDomainName } />
				<div className="email-verification__explanation">
					<h1 className="email-verification__heading">Important: Verify Your Email Address</h1>
					{ verificationExplanation }
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
)( localize( EmailVerificationCard ) );
