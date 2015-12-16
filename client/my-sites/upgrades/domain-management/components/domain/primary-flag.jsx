/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';

const DomainPrimaryFlag = React.createClass( {
	propTypes: {
		domain: React.PropTypes.object.isRequired
	},

	render() {
		if ( this.props.domain.isPrimary ) {
			return (
				<Notice isCompact status="is-success">{ this.translate( 'Primary Domain' ) }</Notice>
			);
		}

		return null;
	}
} );

module.exports = DomainPrimaryFlag;
