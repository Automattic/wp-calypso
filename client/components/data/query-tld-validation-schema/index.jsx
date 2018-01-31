/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { difference, isEmpty, keys } from 'lodash';

/**
 * Internal dependencies
 */
import { getValidationSchemas } from 'state/selectors';
import { requestValidationSchema } from 'state/domains/management/validation-schemas/actions';

export class QueryTldValidationSchema extends Component {
	static propTypes = {
		validationSchemas: PropTypes.object.isRequired,
		requestValidationSchema: PropTypes.func.isRequired,
		tlds: PropTypes.array.isRequired,
	};

	componentWillMount() {
		this.fetchMissingSchemas( this.props.tlds );
	}

	componentWillReceiveProps( nextProps ) {
		const newTlds = nextProps.tlds;
		if ( this.props.tlds !== newTlds ) {
			this.fetchMissingSchemas( newTlds );
		}
	}

	fetchMissingSchemas( tlds ) {
		const missingSchemas = difference( tlds, keys( this.props.validationSchemas ) );
		if ( ! isEmpty( missingSchemas ) ) {
			this.props.requestValidationSchema( missingSchemas );
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
