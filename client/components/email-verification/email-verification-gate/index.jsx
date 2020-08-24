/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import EmailUnverifiedNotice from './email-unverified-notice.jsx';
import { getCurrentUserEmail, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';

/**
 * Style dependencies
 */
import './style.scss';

export class EmailVerificationGate extends React.Component {
	static propTypes = {
		allowUnlaunched: PropTypes.bool,
		noticeText: PropTypes.node,
		noticeStatus: PropTypes.string,
		//connected
		userEmail: PropTypes.string,
		needsVerification: PropTypes.bool,
	};

	static defaultProps = {
		noticeText: null,
		noticeStatus: '',
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
						noticeStatus={ this.props.noticeStatus }
					/>
					<div className="email-verification-gate__content">{ this.props.children }</div>
				</div>
			);
		}

		return <div>{ this.props.children }</div>;
	}
}

export default connect( ( state, { allowUnlaunched } ) => {
	const userEmail = getCurrentUserEmail( state );
	const needsVerification =
		! isCurrentUserEmailVerified( state ) &&
		! ( allowUnlaunched && isUnlaunchedSite( state, getSelectedSiteId( state ) ) );

	return { userEmail, needsVerification };
} )( EmailVerificationGate );
