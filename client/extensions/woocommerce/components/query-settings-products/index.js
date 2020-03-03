/**
 * External dependencies
 *
 */

import { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchSettingsProducts } from 'woocommerce/state/sites/settings/products/actions';

class QuerySettingsProducts extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		fetchSettingsProducts: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.props.fetchSettingsProducts( this.props.siteId );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId ) {
			return;
		}
		nextProps.fetchSettingsProducts( nextProps.siteId );
	}

	render() {
		return null;
	}
}

export default connect( null, { fetchSettingsProducts } )( QuerySettingsProducts );
