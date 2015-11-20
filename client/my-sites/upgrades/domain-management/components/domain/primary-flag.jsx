/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Flag from 'components/flag';

const DomainPrimaryFlag = React.createClass( {
	propTypes: {
		domain: React.PropTypes.object.isRequired
	},

	render() {
		if ( this.props.domain.isPrimary ) {
			return (
				<Flag
					className="is-primary"
					type="is-success"
					icon="noticon-checkmark">
					{ this.translate( 'Primary Domain' ) }
				</Flag>
			);
		}

		return null;
	}
} );

module.exports = DomainPrimaryFlag;
