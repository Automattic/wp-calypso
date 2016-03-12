/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Button from 'components/button';
import FilePicker from 'components/file-picker';

const FollowingImportButton = React.createClass( {
	getInitialState() {
		return {
			disabled: false
		};
	},

	onPick(files) {
		// we only care about the first file in the list
		const file = files[0];
		console.log(file);

		const req = wpcom.undocumented().importReaderFeed( file, this.onFeedImport );
		req.upload.onprogress = this.onFeedImportProgress;

		this.setState( { disabled: true } );
	},

	onFeedImport(err, data) {
		if (err) return console.log(err.stack);
		console.log(data);
		this.setState( { disabled: false } );
	},

	onFeedImportProgress(event) {
		console.log('onprogress', event);
	},

	render() {
		return (
			<FilePicker accept='text/xml' onPick={ this.onPick } >
				<Button compact disabled={ this.state.disabled } >
					{ this.translate( 'Import' ) }
				</Button>
			</FilePicker>
		);
	}
} );

export default FollowingImportButton;
