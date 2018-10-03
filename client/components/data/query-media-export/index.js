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

class QueryMediaExport extends Component {
	componentDidMount() {
		this.props.requestMediaExport( this.props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	() => ( {} ),
	{ requestMediaExport }
)( QueryMediaExport );
