/**
 * External dependencies
 */
import Blob from 'blob';
import React from 'react';
import { noop } from 'lodash';
import { saveAs } from 'browser-filesaver';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Button from 'components/button';

class ReaderExportButton extends React.Component {
	static propTypes = {
		onError: React.PropTypes.func,
		onExport: React.PropTypes.func,
		saveAs: React.PropTypes.string
	}

	static defaultProps = {
		onError: noop,
		onExport: noop,
		saveAs: 'wpcom-subscriptions.opml',
	}

	constructor( props ) {
		super( props );
		this.state = {
			disabled: false
		};
	}

	onClick = () => {
		wpcom.undocumented().exportReaderFeed( this.onFeed );
		this.setState( {
			disabled: true
		} );
	}

	onFeed = ( err, data ) => {
		this.setState( {
			disabled: false
		} );

		if ( ! err && ! data.success ) {
			err = new Error( this.props.translate( 'Error exporting Reader feed' ) );
		}

		if ( err ) {
			this.props.onError( err );
		} else {
			const blob = new Blob( [ data.opml ], { type: 'text/xml;charset=utf-8' } );
			saveAs( blob, this.props.saveAs );
			this.props.onExport( this.props.saveAs );
		}
	}

	render() {
		return (
			<Button
				className="reader-export-button"
				compact
				disabled={ this.state.disabled }
				onClick={ this.onClick }>
				{ this.props.translate( 'Export' ) }
			</Button>
		);
	}
}

export default localize( ReaderExportButton );
