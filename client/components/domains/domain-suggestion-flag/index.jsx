/**
 * External dependencies
 */
import React from 'react';
import { endsWith } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

class DomainSuggestionFlag extends React.Component {
	render() {
		const newTLDs = [ 'blog' ];

		if ( newTLDs.some( ( tld ) => {
			return endsWith( this.props.domain, tld );
		} ) ) {
			return (
				<Notice
					isCompact
					status="is-success">
					{ this.props.translate( 'New', { context: 'Domain suggestion flag' } ) }
				</Notice>
			);
		}

		return null;
	}
}

DomainSuggestionFlag.propTypes = {
	domain: React.PropTypes.string.isRequired
};

export default localize( DomainSuggestionFlag );
