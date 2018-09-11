/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { fetchShippingClasses } from 'woocommerce/state/sites/shipping-classes/actions';
import { areShippingClassesLoaded } from 'woocommerce/state/sites/shipping-classes/selectors';

class QueryShippingClasses extends React.Component {
	componentDidMount() {
		this.fetch();
	}

	fetch() {
		const { siteId, loaded, fetch } = this.props;

		if ( siteId && ! loaded ) {
			fetch( siteId );
		}
	}

	componentDidUpdate( prevProps ) {
		// If the site ID changed, fetch new settings
		if ( prevProps.siteId !== this.props.siteId ) {
			this.fetch();
		}
	}

	render() {
		return null;
	}
}

QueryShippingClasses.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state, ownProps ) => ( {
		loaded: areShippingClassesLoaded( state, ownProps.siteId ),
	} ),
	dispatch =>
		bindActionCreators(
			{
				fetch: fetchShippingClasses,
			},
			dispatch
		)
)( QueryShippingClasses );
