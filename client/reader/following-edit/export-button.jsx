/**
 * External dependencies
 */
import Blob from 'blob';
import React from 'react';
import wpcom from 'lib/wp';
import { saveAs } from 'filesaver.js';
import Button from 'components/button';

const FollowingExportButton = React.createClass( {

	getInitialState() {
		return {
			disabled: false
		}
	},

	onClick() {
		this.setState( {
			disabled: true
		} );
		wpcom.undocumented().exportReaderFeed( {}, this.onFeed );
	},

	onFeed( err, data ) {
		// TODO: handle `err` or `!data.success`
		var blob = new Blob( [ data.opml ], { type: 'text/xml;charset=utf-8' } );
		saveAs( blob, 'reader.xml' );

		this.setState( {
			disabled: false
		} );
	},

	render() {
		return (
			<Button compact disabled={ this.state.disabled } onClick={ this.onClick }>
				{ this.translate( 'Export to OPML' ) }
			</Button>
		);
	}
} );

export default FollowingExportButton;
