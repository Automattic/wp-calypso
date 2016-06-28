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
	constructor( props ) {
		super( props );
		this.requestSitePurchases = this.requestSitePurchases.bind( this );
	}

	requestSitePurchases( props = this.props ) {
		this.props.fetchSitePurchases( props.siteId );
	}

	componentWillMount() {
		this.requestSitePurchases();
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.fetchingSitePurchases ||
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
	fetchingSitePurchases: PropTypes.bool.isRequired,
	fetchSitePurchases: PropTypes.func.isRequired
};

export default connect(
	state => {
		return {
			fetchingSitePurchases: isFetchingSitePurchases( state )
		};
	},
	{ fetchSitePurchases }
)( QuerySitePurchases );
