// TODO: Remove this component after the next step of retrieving data via
// the API is completed.

/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Internal dependencies
 */
import { fetchProductCategories } from './state/wc-api/actions';

class TestQuery extends Component {
	static propTypes ={
		siteId: PropTypes.number.isRequired,
		requestingModuleSettings: PropTypes.bool,
		fetchProductCategories: PropTypes.func,
	};

	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( props.requestingModuleSettings ) {
			return;
		}

		props.fetchProductCategories( props.siteId );
	}

	render() {
		return null;
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return { siteId };
	},
	{ fetchProductCategories }
)( TestQuery );

