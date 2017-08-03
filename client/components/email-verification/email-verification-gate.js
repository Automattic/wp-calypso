/**
 * External dependencies
 */
import * as React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import EmailUnverifiedNotice from './email-unverified-notice.jsx';
import { getCurrentUser } from 'state/current-user/selectors';
import { isCurrentUserEmailVerified } from 'state/current-user/selectors';

export class EmailVerificationGate extends React.Component {
	static propTypes = {
		noticeText: React.PropTypes.node,
		noticeStatus: React.PropTypes.string,
		//connected
		userEmail: React.PropTypes.string,
		needsVerification: React.PropTypes.bool
	};

	static defaultProps = {
		noticeText: null,
		noticeStatus: ''
	};

	handleFocus = ( e ) => {
		e.target.blur();
	};

	render() {
		if ( this.props.needsVerification ) {
			return (
				<div tabIndex="-1" className="email-verification-gate" onFocus={ this.handleFocus }>
					<EmailUnverifiedNotice
						userEmail={ this.props.userEmail }
						noticeText={ this.props.noticeText }
						noticeStatus={ this.props.noticeStatus } />
					<div className="email-verification-gate__content">
						{ this.props.children }
					</div>
				</div>
			);
		}

		return <div>{ this.props.children }</div>;
	}
}

export default connect(
	( state ) => {
		const user = getCurrentUser( state );
		return {
			userEmail: user && user.email,
			needsVerification: ! isCurrentUserEmailVerified( state )
		};
	}
)( EmailVerificationGate );
