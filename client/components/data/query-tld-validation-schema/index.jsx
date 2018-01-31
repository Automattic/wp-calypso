/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { difference, isEmpty, isEqual, keys } from 'lodash';

/**
 * Internal dependencies
 */
import { getValidationSchemas } from 'state/selectors';
import { requestValidationSchemas } from 'state/domains/management/validation-schemas/actions';

export class QueryTldValidationSchema extends Component {
	static propTypes = {
		validationSchemas: PropTypes.object.isRequired,
		requestValidationSchemas: PropTypes.func.isRequired,
		tlds: PropTypes.array.isRequired,
	};

	componentDidMount() {
		this.fetchMissingSchemas( this.props.tlds );
	}

	componentWillReceiveProps( nextProps ) {
		const newTlds = nextProps.tlds;
		if ( ! isEqual( this.props.tlds, newTlds ) ) {
			this.fetchMissingSchemas( newTlds );
		}
	}

	fetchMissingSchemas( tlds ) {
		const missingSchemas = difference( tlds, keys( this.props.validationSchemas ) );
		if ( ! isEmpty( missingSchemas ) ) {
			this.props.requestValidationSchemas( missingSchemas );
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
	{ requestValidationSchemas }
)( QueryTldValidationSchema );
