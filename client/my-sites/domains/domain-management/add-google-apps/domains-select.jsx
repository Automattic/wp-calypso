const PropTypes = require('prop-types');
/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const { getGoogleAppsSupportedDomains } = require( 'lib/domains' );

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
			options = <option>{ this.translate( 'Loading' ) }...</option>;
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

module.exports = DomainsSelect;
