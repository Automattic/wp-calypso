/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Flag = require( 'components/flag' );

const DomainSuggestionFlag = React.createClass( {
	propTypes: {
		domain: React.PropTypes.string.isRequired
	},

	render() {
		let newTLDs = ['.live'];

		if ( newTLDs.some( function( tld ) {
				return this.props.domain.endsWith( tld );
			}, this ) ) {
			return (
				<Flag
					type="is-success">
					{ this.translate( 'New', {context: 'Domain suggestion flag'} ) }
				</Flag>
			);
		}

		return null;
	}
} );

export default DomainSuggestionFlag;
