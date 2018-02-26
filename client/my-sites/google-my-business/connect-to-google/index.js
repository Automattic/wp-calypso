/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';

class ConnectToGoogle extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate, siteId } = this.props;
		const href = '/google-my-business/show-list-of-locations/' + siteId;
		return (
			<div className="connect-to-google">
				<a href={ href }>
					<img src="/calypso/images/google-my-business/connect-with-google.png" />
				</a>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( ConnectToGoogle ) );
