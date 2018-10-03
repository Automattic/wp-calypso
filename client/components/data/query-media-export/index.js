/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestMediaExport } from 'state/site-settings/exporter/actions';
import getMediaExportUrl from 'state/selectors/get-media-export-url';

class QueryMediaExport extends Component {
	componentDidMount() {
		if ( this.props.mediaExportUrl ) {
			return;
		}

		this.props.requestMediaExport( this.props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		mediaExportUrl: getMediaExportUrl( state ),
	} ),
	{ requestMediaExport }
)( QueryMediaExport );
