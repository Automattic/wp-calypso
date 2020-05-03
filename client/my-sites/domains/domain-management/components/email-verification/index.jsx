/**
 * External dependencies
 *
 */
import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { errorNotice, successNotice } from 'state/notices/actions';

/**
 * Style dependencies
 */
import './style.scss';

class EmailVerificationCard extends React.Component {
	static propTypes = {
		changeEmailHref: PropTypes.string,
		contactEmail: PropTypes.string.isRequired,
		errorMessage: PropTypes.string.isRequired,
		headerText: PropTypes.string,
		verificationExplanation: PropTypes.array.isRequired,
		resendVerification: PropTypes.func.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
		compact: PropTypes.bool,
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
		const {
			errorMessage,
			resendVerification,
			selectedDomainName,
			contactEmail,
			translate,
			compact,
		} = this.props;

		event.preventDefault();

		this.setState( { submitting: true } );

		resendVerification( selectedDomainName, ( error ) => {
			if ( error ) {
				const message = get( error, 'message', errorMessage );
				this.props.errorNotice( message );
			} else if ( compact ) {
				this.props.successNotice(
					translate( 'Check your email — instructions sent to %(email)s.', {
						args: { email: contactEmail },
					} ),
					{ duration: 5000 }
				);
			} else {
				this.timer = setTimeout( this.revertToWaitingState, 5000 );
				this.setState( { emailSent: true } );
			}

			this.setState( { submitting: false } );
		} );
	};

	renderStatus() {
		const { changeEmailHref, contactEmail, translate } = this.props;
		const { emailSent, submitting } = this.state;
		const statusClassNames = classNames( 'email-verification__status-container', {
			waiting: ! emailSent,
			sent: emailSent,
		} );
		let statusIcon = 'notice-outline';
		let statusText = translate( 'Check your email — instructions sent to %(email)s.', {
			args: { email: contactEmail },
		} );

		if ( emailSent ) {
			statusIcon = 'mail';
			statusText = translate( 'Sent to %(email)s. Check your email to verify.', {
				args: { email: contactEmail },
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

	renderCompact() {
		const { translate } = this.props;
		const { submitting } = this.state;

		return (
			<div>
				<p>{ this.props.verificationExplanation }</p>
				<Button busy={ submitting } disabled={ submitting } onClick={ this.handleSubmit }>
					{ submitting ? translate( 'Sending…' ) : translate( 'Resend email' ) }
				</Button>
			</div>
		);
	}

	render() {
		if ( this.props.compact ) {
			return this.renderCompact();
		}

		return (
			<Card highlight="warning" className="email-verification">
				<div className="email-verification__explanation">
					<h1 className="email-verification__heading">{ this.props.headerText }</h1>
					{ this.props.verificationExplanation }
				</div>
				{ this.renderStatus() }
			</Card>
		);
	}
}

export default connect( null, { errorNotice, successNotice } )( localize( EmailVerificationCard ) );
