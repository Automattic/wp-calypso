/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Internal dependencies
 */

import EmailUnverifiedNotice from './email-unverified-notice.jsx';
import userUtils from 'lib/user/utils';
import sitesFactory from 'lib/sites-list';
import userFactory from 'lib/user';
import config from 'config';

const sites = sitesFactory();
const user = userFactory();

export default class EmailVerificationGate extends React.Component {

	constructor( props ) {
		super( props );

		this.updateVerificationState = this.updateVerificationState.bind( this );
		this.handleFocus = this.handleFocus.bind( this );

		this.state = {
			needsVerification: userUtils.needsVerificationForSite( sites.getSelectedSite() ),
		};
	}

	componentWillMount() {
		if ( ! config( 'email_verification_gate' ) ) return;

		user.on( 'change', this.updateVerificationState );
		user.on( 'verify', this.updateVerificationState );
		sites.on( 'change', this.updateVerificationState );
	}

	componentWillUnmount() {
		if ( ! config( 'email_verification_gate' ) ) return;

		user.off( 'change', this.updateVerificationState );
		user.off( 'verify', this.updateVerificationState );
		sites.off( 'change', this.updateVerificationState );
	}

	updateVerificationState() {
		this.setState( {
			needsVerification: userUtils.needsVerificationForSite( sites.getSelectedSite() ),
		} );
	}

	handleFocus( e ) {
		e.target.blur();
	}

	render() {
		if ( config( 'email_verification_gate' ) && this.state.needsVerification ) {
			return (
				<div tabIndex="-1" className="email-verification-gate" onFocus={ this.handleFocus }>
					<EmailUnverifiedNotice />
					<div className="email-verification-gate__content">
						{	this.props.children }
					</div>
				</div>
			);
		}

		return <div>{ this.props.children }</div>;
	}
}
