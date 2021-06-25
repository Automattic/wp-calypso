/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import { requestSiteTerms } from 'calypso/state/terms/actions';
import { isRequestingTermsForQuery } from 'calypso/state/terms/selectors';

class QueryTerms extends Component {
	UNSAFE_componentWillMount() {
		this.request( this.props );
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if (
			this.props.siteId === nextProps.siteId &&
			this.props.taxonomy === nextProps.taxonomy &&
			isShallowEqual( this.props.query, nextProps.query )
		) {
			return;
		}

		this.request( nextProps );
	}

	request( props ) {
		if ( props.requesting || ! props.siteId ) {
			return;
		}

		props.requestSiteTerms( props.siteId, props.taxonomy, props.query );
	}

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return null;
	}
}

QueryTerms.propTypes = {
	siteId: PropTypes.number,
	taxonomy: PropTypes.string.isRequired,
	query: PropTypes.object,
	requesting: PropTypes.bool.isRequired,
	requestSiteTerms: PropTypes.func.isRequired,
};

QueryTerms.defaultProps = {
	query: {},
};

export default connect(
	( state, ownProps ) => {
		return {
			requesting: isRequestingTermsForQuery(
				state,
				ownProps.siteId,
				ownProps.taxonomy,
				ownProps.query
			),
		};
	},
	{
		requestSiteTerms,
	}
)( QueryTerms );
