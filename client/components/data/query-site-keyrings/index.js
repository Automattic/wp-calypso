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
import { isRequestingSiteKeyrings } from 'state/site-keyrings/selectors';
import { requestSiteKeyrings } from 'state/site-keyrings/actions';

class QuerySiteKeyrings extends Component {
	componentDidMount() {
		this.requestKeyrings( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		const { siteId } = this.props;
		if ( ! nextProps.siteId || siteId === nextProps.siteId ) {
			return;
		}

		this.requestKeyrings( nextProps );
	}

	requestKeyrings( props ) {
		const { requestingSiteKeyrings, siteId } = props;
		if ( ! requestingSiteKeyrings && siteId ) {
			props.requestSiteKeyrings( siteId );
		}
	}

	render() {
		return null;
	}
}

QuerySiteKeyrings.propTypes = {
	siteId: PropTypes.number,
	requestingSiteKeyrings: PropTypes.bool,
	requestSiteKeyrings: PropTypes.func,
};

export default connect(
	( state, { siteId } ) => ( {
		requestingSiteKeyrings: isRequestingSiteKeyrings( state, siteId ),
	} ),
	{ requestSiteKeyrings }
)( QuerySiteKeyrings );
