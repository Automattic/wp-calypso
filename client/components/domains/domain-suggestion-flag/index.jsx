/**
 * External dependencies
 */
import React from 'react';
import endsWith from 'lodash/endsWith';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

const DomainSuggestionFlag = React.createClass( {
	propTypes: {
		domain: React.PropTypes.string.isRequired
	},

	render() {
		let newTLDs = ['.live'];

		if ( newTLDs.some( function( tld ) {
				return endsWith( this.props.domain, tld );
			}, this ) ) {
			return (
				<Notice
					isCompact
					status="is-success">
					{ this.translate( 'New', {context: 'Domain suggestion flag'} ) }
				</Notice>
			);
		}

		return null;
	}
} );

export default DomainSuggestionFlag;
