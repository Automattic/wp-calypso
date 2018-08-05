/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { isOffline } from 'state/application/selectors';

class Offline extends Component {
	static getDerivedStateFromProps( props ) {
		return {
			isOffline: props.isOffline,
		};
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevState.isOffline && ! this.state.isOffline ) {
			if ( typeof window !== 'undefined' ) {
				window.location.reload();
			}
		}
	}

	render() {
		const { translate } = this.props;
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/error.svg"
				title={ translate( 'No Internet' ) }
				line={ translate(
					'Try checking the network cables, modem and router or reconnecting to Wi-Fi'
				) }
			/>
		);
	}
}

export default connect( state => ( {
	isOffline: isOffline( state ),
} ) )( localize( Offline ) );
