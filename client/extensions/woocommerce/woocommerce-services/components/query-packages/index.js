/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { fetchSettings } from 'client/extensions/woocommerce/woocommerce-services/state/packages/actions';
import { isLoaded, isFetching, isFetchError } from 'client/extensions/woocommerce/woocommerce-services/state/packages/selectors';

class QueryPackages extends Component {
	fetch( props ) {
		const { siteId, loaded, fetching, error } = props;
		if ( ! loaded && ! fetching && ! error ) {
			this.props.fetchSettings( siteId );
		}
	}

	componentWillMount() {
		this.fetch( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.fetch( nextProps );
	}

	render() {
		return null;
	}
}

QueryPackages.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default connect(
	( state ) => ( {
		loaded: isLoaded( state ),
		fetching: isFetching( state ),
		error: isFetchError( state ),
	} ),
	( dispatch ) => bindActionCreators( {
		fetchSettings,
	}, dispatch )
)( QueryPackages );
