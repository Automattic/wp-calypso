/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingDomainsSuggestions } from 'state/domains/suggestions/selectors';
import { requestDomainsSuggestions } from 'state/domains/suggestions/actions';

function getQueryObject( props ) {
	const { query, vendor, quantity, includeSubdomain } = props;
	return {
		query,
		vendor,
		quantity,
		include_wordpressdotcom: includeSubdomain
	};
}

class QueryDomainsSuggestions extends Component {

	constructor( props ) {
		super( props );
		this.requestDomainsSuggestions = this.requestDomainsSuggestions.bind( this );
	}

	requestDomainsSuggestions( props = this.props ) {
		if ( ! props.requestingDomainsSuggestions ) {
			props.requestDomainsSuggestions( getQueryObject( props ) );
		}
	}

	componentWillMount() {
		this.requestDomainsSuggestions();
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.requestingDomainsSuggestions ||
			( this.props.query === nextProps.query &&
				this.props.vendor === nextProps.vendor &&
				this.props.quantity === nextProps.quantity &&
				this.props.includeSubdomain === nextProps.includeSubdomain ) ) {
			return;
		}
		this.requestDomainsSuggestions( nextProps );
	}

	render() {
		return null;
	}
}

QueryDomainsSuggestions.propTypes = {
	query: PropTypes.string.isRequired,
	vendor: PropTypes.string.isRequired,
	quantity: PropTypes.number,
	includeSubdomain: PropTypes.bool,
	requestingDomainsSuggestions: PropTypes.bool,
	requestDomainsSuggestions: PropTypes.func
};

QueryDomainsSuggestions.defaultProps = {
	requestDomainsSuggestions: () => {},
	includeSubdomain: false,
	quantity: 5
};

export default connect(
	( state, ownProps ) => {
		return {
			requestingDomainsSuggestions: isRequestingDomainsSuggestions( state, getQueryObject( ownProps ) )
		};
	},
	{ requestDomainsSuggestions }
)( QueryDomainsSuggestions );
