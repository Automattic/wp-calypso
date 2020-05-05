/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import { getCurrentUser } from 'state/current-user/selectors';

const debug = debugFactory( 'calypso:redirect-when-logged-in' );

class RedirectWhenLoggedIn extends React.Component {
	static propTypes = {
		delayAtMount: PropTypes.number,
		redirectTo: PropTypes.string.isRequired,
		replaceCurrentLocation: PropTypes.bool,
		waitForEmailAddress: PropTypes.string,
		waitForUserId: PropTypes.number,
	};

	doTheRedirect() {
		debug( this.props.replaceCurrentLocation ? 'replace' : 'assign', this.props.redirectTo );
		this.props.replaceCurrentLocation
			? window.location.replace( this.props.redirectTo )
			: window.location.assign( this.props.redirectTo );
	}

	isUserLoggedIn( user ) {
		const { waitForEmailAddress, waitForUserId } = this.props;

		if ( ! ( user && user.email && user.ID ) ) {
			return false;
		}

		if ( waitForEmailAddress && waitForEmailAddress !== user.email ) {
			return false;
		}

		if ( waitForUserId && waitForUserId !== user.ID ) {
			return false;
		}

		return true;
	}

	storageEventHandler = ( e ) => {
		if ( e.key === 'wpcom_user_id' && e.newValue != null ) {
			debug( 'detected change of wpcom_user_id, redirecting' );
			this.doTheRedirect();
		}
	};

	componentDidMount() {
		const { currentUser, delayAtMount } = this.props;

		if ( this.isUserLoggedIn( currentUser ) ) {
			if ( delayAtMount ) {
				setTimeout( () => {
					this.doTheRedirect();
				}, delayAtMount );
				return;
			}
			this.doTheRedirect();
			return;
		}
		debug( 'adding storage event listener' );
		window.addEventListener( 'storage', this.storageEventHandler );
	}

	componentWillUnmount() {
		debug( 'removing storage event listener' );
		window.removeEventListener( 'storage', this.storageEventHandler );
	}

	render() {
		return null;
	}
}

const mapState = ( state ) => {
	return {
		currentUser: getCurrentUser( state ),
	};
};

export default connect( mapState )( RedirectWhenLoggedIn );
