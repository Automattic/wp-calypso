/**
 * External dependencies
 */
import React from 'react';
import Blob from 'blob';
import { saveAs } from 'browser-filesaver';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { errorNotice } from 'state/notices/actions';

class ReaderExportButton extends React.Component {
	static propTypes = {
		saveAs: React.PropTypes.string,
	}

	static defaultProps = {
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
			this.props.errorNotice(
				this.props.translate( 'Sorry, there was a problem creating your export file.' )
			);
			return;
		}

		const blob = new Blob( [ data.opml ], { type: 'text/xml;charset=utf-8' } );
		saveAs( blob, this.props.saveAs );
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

export default connect(
	null,
	{ errorNotice },
)( localize( ReaderExportButton ) );
