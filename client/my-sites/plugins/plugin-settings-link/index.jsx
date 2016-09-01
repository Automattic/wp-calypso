/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'PluginSettingsLink',

	propTypes: {
		linkUrl: PropTypes.string.isRequired,
	},

	render() {
		if ( ! this.props.linkUrl ) {
			return;
		}

		return (
			<a className="plugin-settings-link"
				href={ this.props.linkUrl }
				target="_blank"
				rel="noopener noreferrer">
				{ this.translate( 'Setup' ) }
				<Gridicon size={ 18 } icon="external" />
			</a>
		);
	}
} );
