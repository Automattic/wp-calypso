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
	constructor() {
		super( ...arguments );

		const { siteId, loaded, fetch } = this.props;

		if ( siteId && ! loaded ) {
			fetch( siteId );
		}
	}

	componentDidUpdate( { siteId, loaded } ) {
		//site ID changed, fetch new settings
		if ( siteId !== this.props.siteId && ! loaded ) {
			this.fetch( siteId );
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
