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

	UNSAFE_componentWillMount() {
		this.request( this.props.siteId );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
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

export default connect( null, { requestSiteChecklist } )( QuerySiteChecklist );
