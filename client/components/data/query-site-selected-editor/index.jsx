/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSelectedEditor } from 'state/selected-editor/actions';

export class QuerySiteSelectedEditor extends Component {
	static propTypes = {
		siteId: PropTypes.number,
	};

	componentDidMount() {
		this.request();
	}

	componentDidUpdate( { siteId } ) {
		if ( siteId !== this.props.siteId ) {
			this.request();
		}
	}

	request() {
		const { siteId } = this.props;
		if ( siteId ) {
			this.props.requestSelectedEditor( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, { requestSelectedEditor } )( QuerySiteSelectedEditor );
