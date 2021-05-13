/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { infoNotice, removeNotice } from 'calypso/state/notices/actions';

export class GlobalNotice extends Component {
	static propTypes = {
		displayNotice: PropTypes.func.isRequired,
		removeNotice: PropTypes.func.isRequired,
		text: PropTypes.string.isRequired,
	};

	UNSAFE_componentWillMount() {
		const { notice } = this.props.displayNotice( this.props.text, { isPersistent: true } );
		this.notice = notice;
	}

	componentWillUnmount() {
		if ( this.notice ) {
			this.props.removeNotice( this.notice.noticeId );
		}
	}

	render() {
		return null;
	}
}

export const InfoNotice = connect( null, {
	displayNotice: infoNotice,
	removeNotice,
} )( GlobalNotice );
