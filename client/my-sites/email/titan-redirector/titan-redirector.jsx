/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
// import wp from 'calypso/lib/wp';
import EmptyContent from 'calypso/components/empty-content';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

class TitanRedirector extends Component {
	componentDidMount() {
		// call wp.undocumented().
	}

	render() {
		const { translate, isLoggedIn } = this.props;

		if ( ! isLoggedIn ) {
			return <EmptyContent title={ translate( 'You need to be logged in to open this page' ) } />;
		}

		return <EmptyContent title={ translate( 'Loading…' ) } />;
	}
}

export default connect( ( state ) => {
	return {
		isLoggedIn: isUserLoggedIn( state ),
	};
} )( localize( TitanRedirector ) );
