/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Button from 'components/button';
import FilePicker from 'components/file-picker';

const FollowingImportButton = React.createClass( {
	propTypes: {
		onProgress: React.PropTypes.func,
		onError: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onError: noop
		};
	},

	getInitialState() {
		return {
			disabled: false
		};
	},

	onPick( files ) {
		// we only care about the first file in the list
		const file = files[0];
		if ( ! file ) return;

		const req = wpcom.undocumented().importReaderFeed( file, this.onFeedImport );
		req.upload.onprogress = this.onFeedImportProgress;

		this.setState( {
			disabled: true
		} );
	},

	onFeedImport( err, data ) {
		this.setState( {
			disabled: false
		} );

		if ( err ) {
			this.props.onError( err );
		}
		console.log( 'feed import started', data );
	},

	onFeedImportProgress( event ) {
		this.props.onProgress( event );
	},

	render() {
		return (
			<FilePicker accept="text/xml" onPick={ this.onPick } >
				<Button compact disabled={ this.state.disabled } >
					{ this.translate( 'Import' ) }
				</Button>
			</FilePicker>
		);
	}
} );

export default FollowingImportButton;
