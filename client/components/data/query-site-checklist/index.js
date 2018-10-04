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
import { requestSiteChecklist } from 'state/checklist/actions';

class QuerySiteChecklist extends Component {
	static propTypes = {
		requestSiteChecklist: PropTypes.func,
		siteId: PropTypes.number,
	};

	componentWillMount() {
		this.request( this.props.siteId );
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.siteId || this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.request( nextProps.siteId );
	}

	request( siteId ) {
		if ( siteId ) {
			this.props.requestSiteChecklist( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	null,
	{ requestSiteChecklist }
)( QuerySiteChecklist );
