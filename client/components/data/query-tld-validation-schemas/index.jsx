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
import getValidationSchemas from 'state/selectors/get-validation-schemas';
import { requestValidationSchemas } from 'state/domains/management/validation-schemas/actions';

export class QueryTldValidationSchemas extends Component {
	static propTypes = {
		validationSchemas: PropTypes.object.isRequired,
		requestValidationSchemas: PropTypes.func.isRequired,
		tlds: PropTypes.array.isRequired,
	};

	componentDidMount() {
		this.fetchMissingSchemas( this.props.tlds );
	}

	componentDidUpdate( { tlds } ) {
		this.fetchMissingSchemas( difference( tlds, this.props.tlds ) );
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
	( state ) => ( {
		validationSchemas: getValidationSchemas( state ),
	} ),
	{ requestValidationSchemas }
)( QueryTldValidationSchemas );
