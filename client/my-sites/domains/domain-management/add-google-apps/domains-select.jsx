/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { getGoogleAppsSupportedDomains } from 'lib/domains';

const DomainsSelect = React.createClass( {
	propTypes: {
		domains: PropTypes.object.isRequired
	},

	render() {
		let domainRegistrations,
			disabled,
			options;

		if ( this.props.domains.hasLoadedFromServer ) {
			domainRegistrations = getGoogleAppsSupportedDomains( this.props.domains.list );
			disabled = false;
			options = domainRegistrations.map( ( domain ) => {
				return (
					<option value={ domain.name } key={ domain.name }>
						@{ domain.name }
					</option>
				);
			} );
		} else {
			disabled = true;
			options = <option>{ this.props.translate( 'Loading' ) }...</option>;
		}

		return (
			<select value={ this.props.value }
				onChange={ this.props.onChange }
				onFocus={ this.props.onFocus }
				disabled={ disabled }>
				{ options }
			</select>
		);
	}
} );

export default localize( DomainsSelect );
