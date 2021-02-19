/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteKeyrings } from 'calypso/state/site-keyrings/selectors';
import { requestSiteKeyrings } from 'calypso/state/site-keyrings/actions';

class QuerySiteKeyrings extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		requestingSiteKeyrings: PropTypes.bool.isRequired,
		requestSiteKeyrings: PropTypes.func.isRequired,
	};

	state = {
		siteId: null,
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( ! nextProps.siteId || prevState.siteId === nextProps.siteId ) {
			return null;
		}

		return { siteId: nextProps.siteId };
	}

	shouldComponentUpdate( nextProps ) {
		return this.state.siteId !== nextProps.siteId;
	}

	componentDidMount() {
		this.requestKeyrings();
	}

	componentDidUpdate() {
		this.requestKeyrings();
	}

	requestKeyrings() {
		const { siteId } = this.state;
		if ( ! this.props.requestingSiteKeyrings && siteId ) {
			this.props.requestSiteKeyrings( siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		requestingSiteKeyrings: isRequestingSiteKeyrings( state, siteId ),
	} ),
	{ requestSiteKeyrings }
)( QuerySiteKeyrings );
