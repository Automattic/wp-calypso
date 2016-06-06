/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import DocsExample from 'components/docs-example';
import FilePicker from 'components/file-picker';

export default class FilePickers extends React.Component {
	constructor( props ) {
		super( props );
	}

	onSingle( files ) {
		alert( 'Selected file: ' + JSON.stringify( files[0].name ) );
	}

	onMulti( files ) {
		alert( 'Selected files:\n' + [].slice.call( files ).map( ( file ) => {
			return '  ' + JSON.stringify( file.name );
		} ).join( '\n' ) );
	}

	render() {
		return (
			<DocsExample
				title="File Picker"
				url="/devdocs/design/file-pickers"
				componentUsageStats={ this.props.getUsageStats( FilePicker ) }
			>
				<Card>

					<h4>Select a single file:</h4>
					<FilePicker onPick={ this.onSingle } >
						<Button>Single Item</Button>
					</FilePicker>

					<h4>Select a multiple files:</h4>
					<FilePicker multiple onPick={ this.onMulti } >
						<Button>Multiple Items</Button>
					</FilePicker>

					<h4>Select a directory:</h4>
					<FilePicker directory onPick={ this.onMulti } >
						<Button>Directory</Button>
					</FilePicker>

					<h4>Select an image file:</h4>
					<FilePicker accept="image/*" onPick={ this.onSingle } >
						<Button>JPEG / PNG / GIF</Button>
					</FilePicker>

					<h4>Any internal content works:</h4>
					<FilePicker onPick={ this.onSingle } >
						<a href="#">Select File…</a>
					</FilePicker>

				</Card>
			</DocsExample>
		);
	}
}

FilePickers.displayName = 'FilePickers';
