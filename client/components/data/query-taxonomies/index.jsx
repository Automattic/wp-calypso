/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostTypeTaxonomies } from 'state/post-types/taxonomies/actions';
import { isRequestingPostTypeTaxonomies } from 'state/post-types/taxonomies/selectors';

class QueryTaxonomies extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				this.props.postType === nextProps.postType ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.requesting ) {
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
	siteId: PropTypes.number.isRequired,
	postType: PropTypes.string.isRequired,
	requesting: PropTypes.bool.isRequired,
	requestPostTypeTaxonomies: PropTypes.func.isRequired
};

export default connect(
	( state, ownProps ) => {
		return {
			requesting: isRequestingPostTypeTaxonomies( state, ownProps.siteId, ownProps.postType )
		};
	},
	{
		requestPostTypeTaxonomies
	}
)( QueryTaxonomies );
