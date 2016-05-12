/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteTerms } from 'state/terms/actions';
import { isRequestingSiteTaxonomyTerms } from 'state/terms/selectors';

class QueryTerms extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				this.props.taxonomy === nextProps.taxonomy ) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.requesting ) {
			return;
		}

		props.requestSiteTerms( props.siteId, props.taxonomy );
	}

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return null;
	}
}

QueryTerms.propTypes = {
	siteId: PropTypes.number.isRequired,
	taxonomy: PropTypes.string.isRequired,
	query: PropTypes.object,
	requesting: PropTypes.bool.isRequired,
	requestSiteTerms: PropTypes.func.isRequired
};

export default connect(
	( state, ownProps ) => {
		return {
			requesting: isRequestingSiteTaxonomyTerms( state, ownProps.siteId, ownProps.taxonomy )
		};
	},
	{
		requestSiteTerms
	}
)( QueryTerms );
