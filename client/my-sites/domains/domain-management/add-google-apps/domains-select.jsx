/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

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
		const { isRequestingSiteDomains, onChange, onFocus, value } = this.props;
		return (
			<select
				value={ value }
				onChange={ onChange }
				onFocus={ onFocus }
				disabled={ isRequestingSiteDomains }
			>
				{ isRequestingSiteDomains && this.renderLoadingState() }
				{ ! isRequestingSiteDomains && this.renderDomainSelect() }
			</select>
		);
	}
}

DomainsSelect.propTypes = {
	domains: PropTypes.array.isRequired,
	isRequestingSiteDomains: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
	onFocus: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
};

export default localize( DomainsSelect );
