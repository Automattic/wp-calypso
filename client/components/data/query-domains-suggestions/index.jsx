/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingDomainsSuggestions } from 'calypso/state/domains/suggestions/selectors';
import { requestDomainsSuggestions } from 'calypso/state/domains/suggestions/actions';

function getQueryObject( props ) {
	return {
		include_wordpressdotcom: props.includeSubdomain,
		quantity: props.quantity,
		query: props.query,
		recommendation_context: props.recommendationContext,
		vendor: props.vendor,
		vertical: props.vertical,
	};
}

class QueryDomainsSuggestions extends PureComponent {
	static propTypes = {
		includeSubdomain: PropTypes.bool,
		quantity: PropTypes.number,
		query: PropTypes.string.isRequired,
		recommendation_context: PropTypes.string,
		requestDomainsSuggestions: PropTypes.func,
		requestingDomainsSuggestions: PropTypes.bool,
		vendor: PropTypes.string.isRequired,
	};

	static defaultProps = {
		includeSubdomain: false,
		quantity: 5,
		requestDomainsSuggestions: () => {},
	};

	componentDidMount() {
		this.requestDomainsSuggestions();
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.requestingDomainsSuggestions ||
			( prevProps.query === this.props.query &&
				prevProps.vendor === this.props.vendor &&
				prevProps.quantity === this.props.quantity &&
				prevProps.includeSubdomain === this.props.includeSubdomain )
		) {
			return;
		}
		this.requestDomainsSuggestions();
	}

	requestDomainsSuggestions() {
		if ( ! this.props.requestingDomainsSuggestions ) {
			this.props.requestDomainsSuggestions( getQueryObject( this.props ) );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			requestingDomainsSuggestions: isRequestingDomainsSuggestions(
				state,
				getQueryObject( ownProps )
			),
		};
	},
	{ requestDomainsSuggestions }
)( QueryDomainsSuggestions );
