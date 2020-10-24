/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostTypeTaxonomies } from 'calypso/state/post-types/taxonomies/actions';
import { isRequestingPostTypeTaxonomies } from 'calypso/state/post-types/taxonomies/selectors';

class QueryTaxonomies extends Component {
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId && this.props.postType === nextProps.postType ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.requesting || ! props.siteId ) {
			return;
		}

		props.requestPostTypeTaxonomies( props.siteId, props.postType );
	}

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return null;
	}
}

QueryTaxonomies.propTypes = {
	siteId: PropTypes.number,
	postType: PropTypes.string.isRequired,
	requesting: PropTypes.bool.isRequired,
	requestPostTypeTaxonomies: PropTypes.func.isRequired,
};

export default connect(
	( state, ownProps ) => {
		return {
			requesting: isRequestingPostTypeTaxonomies( state, ownProps.siteId, ownProps.postType ),
		};
	},
	{
		requestPostTypeTaxonomies,
	}
)( QueryTaxonomies );
