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
import { requestSiteChecklist } from 'state/site-checklist/actions';

class QuerySiteChecklist extends Component {
	static propTypes = {
		requestSiteChecklist: PropTypes.func,
		siteId: PropTypes.number,
	};

	componentWillMount() {
		this.request();
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.siteId || this.props.siteId === nextProps.siteId ) {
			return;
		}

		this.request();
	}

	request() {
		this.props.requestSiteChecklist( this.props.siteId );
	}

	render() {
		return null;
	}
}

export default connect( () => ( {} ), { requestSiteChecklist } )( QuerySiteChecklist );
