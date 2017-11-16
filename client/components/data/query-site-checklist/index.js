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
import { isRequestingSiteChecklist } from 'state/site-checklist/selectors';
import { requestSiteChecklist } from 'state/site-checklist/actions';

class QuerySiteChecklist extends Component {
	componentWillMount() {
		this.requestChecklist( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;
		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.requestChecklist( nextProps );
	}

	requestChecklist( props ) {
		const { requestingSiteChecklist, siteId } = props;
		if ( ! requestingSiteChecklist && siteId ) {
			requestSiteChecklist( siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySiteChecklist.propTypes = {
	siteId: PropTypes.number,
	requestingSiteChecklist: PropTypes.bool,
	requestSiteChecklist: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => {
		return {
			requestingSiteChecklist: isRequestingSiteChecklist( state, siteId ),
		};
	},
	{ requestSiteChecklist }
)( QuerySiteChecklist );
