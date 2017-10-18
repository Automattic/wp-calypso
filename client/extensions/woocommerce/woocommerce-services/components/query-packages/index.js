/**
 * External dependencies
 */
import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { fetchSettings } from 'woocommerce/woocommerce-services/state/packages/actions';
import {
	isLoaded,
	isFetching,
	isFetchError,
} from 'woocommerce/woocommerce-services/state/packages/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

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

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
		loaded: isLoaded( state ),
		fetching: isFetching( state ),
		error: isFetchError( state ),
	} ),
	( dispatch ) => bindActionCreators( {
		fetchSettings,
	}, dispatch )
)( QueryPackages );
