/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { requestCode, resetCode } from 'lib/auth-code-request-store/actions';
import { default as Store, requestState } from 'lib/auth-code-request-store';
import Notice from 'components/notice';

export default React.createClass( {

	componentDidMount: function() {
		Store.on( 'change', this.refreshData );
	},

	componentWillUnmount: function() {
		Store.off( 'change', this.refreshData );
	},

	refreshData: function() {
		this.setState( Store.get() );
	},

	getInitialState: function() {
		return Store.get();
	},

	requestSMSCode: function( e ) {
		e.preventDefault();
		requestCode( this.props.username, this.props.password );
	},

	render: function() {
		const { status, errorLevel, errorMessage } = this.state;

		var noticeStatus = 'is-info';
		var showDismiss = false;
		var message = (
			<a href="#" onClick={ this.requestSMSCode }>{ this.translate( 'Send code via text message.' ) }</a>
		);

		if ( status === requestState.REQUESTING ) {
			message = this.translate( 'Requesting code.' );
		}

		if ( status === requestState.COMPLETE ) {
			noticeStatus = 'is-success';
			message = this.translate( 'Code sent.' );
		}

		if ( errorLevel !== false ) {
			noticeStatus = errorLevel;
			message = errorMessage;
			showDismiss = true;
		}

		return (
			<Notice showDismiss={ showDismiss } status={ noticeStatus } onDismissClick={ resetCode } >
				{ message }
			</Notice>
		);
	}

} )
