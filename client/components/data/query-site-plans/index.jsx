/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { isRequestingSitePlans } from 'state/sites/plans/selectors';
import { fetchSitePlans } from 'state/sites/plans/actions';

class QuerySitePlans extends Component {

	constructor( props ) {
		super( props );
		this.requestPlans = this.requestPlans.bind( this );
	}

	requestPlans( props = this.props ) {
		if ( ! props.requestingSitePlans && props.siteId ) {
			props.fetchSitePlans( props.siteId );
		}
	}

	componentWillMount() {
		this.requestPlans();
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestingSitePlans ||
			! nextProps.siteId ||
			( this.props.siteId === nextProps.siteId ) ) {
			return;
		}
		this.requestPlans( nextProps );
	}

	render() {
		return null;
	}
}

QuerySitePlans.propTypes = {
	siteId: PropTypes.number,
	requestingPlans: PropTypes.bool,
	fetchSitePlans: PropTypes.func
};

QuerySitePlans.defaultProps = {
	fetchSitePlans: () => {}
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingSitePlans: isRequestingSitePlans( state, ownProps.siteId )
		};
	},
	( dispatch ) => {
		return bindActionCreators( {
			fetchSitePlans
		}, dispatch );
	}
)( QuerySitePlans );
