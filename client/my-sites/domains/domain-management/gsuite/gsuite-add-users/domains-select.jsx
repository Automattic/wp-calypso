/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';

class DomainsSelect extends React.Component {
	renderDomainSelect() {
		return this.props.domains.map( domain => {
			return (
				<option value={ domain.name } key={ domain.name }>
					@{ domain.name }
				</option>
			);
		} );
	}

	renderLoadingState() {
		return (
			<option>
				{ this.props.translate( 'Loading' ) }
				...
			</option>
		);
	}

	render() {
		const { domains, isRequestingSiteDomains, isError, onChange, onFocus, value } = this.props;

		return (
			<FormSelect
				value={ value }
				onChange={ onChange }
				onFocus={ onFocus }
				disabled={ isRequestingSiteDomains || 1 === domains.length }
				isError={ isError }
			>
				{ isRequestingSiteDomains && this.renderLoadingState() }
				{ ! isRequestingSiteDomains && this.renderDomainSelect() }
			</FormSelect>
		);
	}
}

DomainsSelect.propTypes = {
	domains: PropTypes.array.isRequired,
	isError: PropTypes.bool,
	isRequestingSiteDomains: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
	onFocus: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
};

DomainsSelect.defaultProps = {
	isError: false,
};

export default localize( DomainsSelect );
