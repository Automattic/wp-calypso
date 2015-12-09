/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {

	displayName: 'Version',

	propTypes: {
		version: React.PropTypes.string.isRequired,
		icon: React.PropTypes.string
	},

	renderIcon() {
		return this.props.icon
			? <Gridicon icon={ this.props.icon } size={ 18 } />
			: null;
	},

	render() {
		return this.props.version
			? <div className="version">
				{ this.renderIcon() }
				{ this.translate( 'Version %s', { args: this.props.version } ) }
			</div>
			: null;
	}
} );
