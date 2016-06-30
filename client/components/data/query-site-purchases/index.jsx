/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetchingSitePurchases } from 'state/purchases/selectors';
import { fetchSitePurchases } from 'state/purchases/actions';

class QuerySitePurchases extends Component {
	requestSitePurchases( props = this.props ) {
		this.props.fetchSitePurchases( props.siteId );
	}

	componentWillMount() {
		this.requestSitePurchases();
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requesting ||
			! nextProps.siteId ||
			( this.props.siteId === nextProps.siteId ) ) {
			return;
		}
		this.requestSitePurchases( nextProps );
	}

	render() {
		return null;
	}
}

QuerySitePurchases.propTypes = {
	siteId: PropTypes.number.isRequired,
	requesting: PropTypes.bool.isRequired,
	fetchSitePurchases: PropTypes.func.isRequired
};

export default connect(
	state => {
		return {
			requesting: isFetchingSitePurchases( state )
		};
	},
	{ fetchSitePurchases }
)( QuerySitePurchases );
