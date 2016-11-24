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
		onError: React.PropTypes.func,
		onImport: React.PropTypes.func,
		onProgress: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onError: noop,
			onImport: noop,
			onProgress: noop
		};
	},

	getInitialState() {
		return {
			disabled: false
		};
	},

	onPick( files ) {
		// we only care about the first file in the list
		const file = files[ 0 ];
		if ( ! file ) return;

		this.fileName = file.name;
		const req = wpcom.undocumented().importReaderFeed( file, this.onImport );
		req.upload.onprogress = this.onImportProgress;

		this.setState( {
			disabled: true
		} );
	},

	onImport( err, data ) {
		this.setState( {
			disabled: false
		} );

		if ( err ) {
			this.props.onError( err );
		} else {
			// tack on the file name since it will be displayed in the UI
			data.fileName = this.fileName;
			this.props.onImport( data );
		}
	},

	onImportProgress( event ) {
		this.props.onProgress( event );
	},

	render() {
		return (
			<FilePicker accept=".xml,.opml" onPick={ this.onPick } >
				<Button compact disabled={ this.state.disabled } >
					{ this.translate( 'Import' ) }
				</Button>
			</FilePicker>
		);
	}
} );

export default FollowingImportButton;
