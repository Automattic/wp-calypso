/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import shallowEqual from 'react-pure-render/shallowEqual';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteTerms } from 'state/terms/actions';
import { isRequestingTermsForQuery } from 'state/terms/selectors';

class QueryTerms extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.siteId === nextProps.siteId &&
				this.props.taxonomy === nextProps.taxonomy &&
				shallowEqual( this.props.query, nextProps.query ) ) {
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
	requestSiteTerms: PropTypes.func.isRequired
};

QueryTerms.defaultProps = {
	query: {}
};

export default connect(
	( state, ownProps ) => {
		return {
			requesting: isRequestingTermsForQuery( state, ownProps.siteId, ownProps.taxonomy, ownProps.query )
		};
	},
	{
		requestSiteTerms
	}
)( QueryTerms );
