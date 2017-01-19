/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isFetching } from 'state/countries/selectors';
import { requestCountries } from 'state/countries/actions';

class QueryCountries extends Component {
	componentWillMount() {
		this.request( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.listType !== nextProps.listType ) {
			this.request( nextProps );
		}
	}

	request( props ) {
		if ( ! props.isRequesting ) {
			props.requestCountries( props.listType );
		}
	}

	render() {
		return null;
	}
}

QueryCountries.propTypes = {
	listType: PropTypes.string.isRequired,
	isRequesting: PropTypes.bool,
	requestCountries: PropTypes.func
};

export default connect(
	( state, { listType } ) => ( {
		isRequesting: isFetching( state, listType )
	} ),
	{ requestCountries }
)( QueryCountries );

