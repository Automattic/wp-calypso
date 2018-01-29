/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getValidationSchemas } from 'state/selectors';
import { requestValidationSchema } from 'state/domains/validation-schemas/actions';

class QueryTldValidationSchema extends Component {
	static propTypes = {
		validationSchemas: PropTypes.object,
		requestValidationSchema: PropTypes.func,
	};

	static defaultProps = {
		requestValidationSchema: () => {},
	};

	componentDidMount() {
		if ( ! this.props.validationSchemas ) {
			this.props.requestValidationSchema();
		}
	}

	render() {
		return null;
	}
}

export default connect(
	state => ( {
		validationSchemas: getValidationSchemas( state ),
	} ),
	{ requestValidationSchema }
)( QueryTldValidationSchema );
