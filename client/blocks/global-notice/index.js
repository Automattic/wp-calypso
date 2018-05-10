/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	errorNotice,
	infoNotice,
	plainNotice,
	removeNotice,
	successNotice,
	warningNotice,
} from 'state/notices/actions';

export class GlobalNotice extends Component {
	static propTypes = {
		displayNotice: PropTypes.func.isRequired,
		removeNotice: PropTypes.func.isRequired,
		text: PropTypes.string.isRequired,
	};

	componentWillMount() {
		const { notice } = this.props.displayNotice( this.props.text, {
			...this.props,
			isPersistent: true,
		} );
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

export const ErrorNotice = connectDisplayHandler( errorNotice )( GlobalNotice );
export const InfoNotice = connectDisplayHandler( infoNotice )( GlobalNotice );
export const PlainNotice = connectDisplayHandler( plainNotice )( GlobalNotice );
export const RemoveNotice = connectDisplayHandler( removeNotice )( GlobalNotice );
export const SuccessNotice = connectDisplayHandler( successNotice )( GlobalNotice );
export const WarningNotice = connectDisplayHandler( warningNotice )( GlobalNotice );

function connectDisplayHandler( displayHandler ) {
	return connect( null, { displayNotice: displayHandler, removeNotice } );
}
