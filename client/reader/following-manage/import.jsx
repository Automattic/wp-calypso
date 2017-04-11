/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal Dependencies
 */
import ReaderImportButton from 'blocks/reader-import-button';
import { successNotice, errorNotice } from 'state/notices/actions';

class FollowingManageImport extends Component {

	onImportSuccess = ( feedImport ) => {
		const message = this.props.translate(
			'{{em}}%(name)s{{/em}} has been received. You`ll get an email when your import is complete.',
			{
				args: { name: feedImport.fileName },
				components: { em: <em /> },
			}
		);
		this.props.successNotice( message );
	}

	onImportFailure = ( error ) => {
		if ( ! error ) {
			return null;
		}

		const message = this.props.translate( 'Whoops, something went wrong. %(message)s. Please try again.', {
			args: { message: error.message }
		} );
		this.props.errorNotice( message );
	}

	render() {
		return (
			<div className="following-manage__import">
				<ReaderImportButton onImport={ this.onImportSuccess } onError={ this.onImportFailure } />
			</div>
		);
	}
}

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice, errorNotice }, dispatch )
)( localize( FollowingManageImport ) );
