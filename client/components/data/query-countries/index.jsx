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
	static propTypes = {
		listType: PropTypes.string.isRequired,
		isRequesting: PropTypes.bool,
		requestCountries: PropTypes.func
	};

	componentDidMount() {
		this.request( this.props );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.listType !== prevProps.listType ) {
			this.request( this.props );
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

export default connect(
	( state, { listType } ) => ( {
		isRequesting: isFetching( state, listType )
	} ),
	{ requestCountries }
)( QueryCountries );

