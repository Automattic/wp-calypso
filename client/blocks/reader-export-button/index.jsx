/**
 * External dependencies
 */
import React from 'react';
import Blob from 'blob';
import { noop } from 'lodash';
import { saveAs } from 'browser-filesaver';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

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

	state = { disabled: false }

	onClick = () => {
		// Don't kick off a new export request if there's one in progress
		if ( this.state.disabled ) {
			return;
		}

		wpcom.undocumented().exportReaderFeed( this.onApiResponse );
		this.setState( {
			disabled: true
		} );
	}

	onApiResponse = ( err, data ) => {
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
			<div className="reader-export-button" onClick={ this.onClick }>
				<Gridicon icon="cloud-download" className="reader-export-button__icon" />
				<span className="reader-export-button__label">
					{ this.props.translate( 'Export' ) }
				</span>
			</div>
		);
	}
}

export default localize( ReaderExportButton );
