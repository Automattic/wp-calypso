/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchSitePurchases } from 'state/purchases/actions';
import { isFetchingSitePurchases } from 'state/purchases/selectors';

class QuerySitePurchases extends Component {
	requestSitePurchases( props = this.props ) {
		if ( props.siteId ) {
			this.props.fetchSitePurchases( props.siteId );
		}
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
	siteId: PropTypes.number,
	requesting: PropTypes.bool,
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
