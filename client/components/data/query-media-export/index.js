import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { requestMediaExport } from 'calypso/state/exporter/actions';
import getMediaExportUrl from 'calypso/state/selectors/get-media-export-url';

class QueryMediaExport extends Component {
	static propTypes = {
		mediaExportUrl: PropTypes.string,
		requestMediaExport: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
	};

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
	( state ) => ( {
		mediaExportUrl: getMediaExportUrl( state ),
	} ),
	{ requestMediaExport }
)( QueryMediaExport );
