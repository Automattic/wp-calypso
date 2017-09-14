/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

const Version = React.createClass( {

	displayName: 'Version',

	propTypes: {
		version: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.number,
		] ).isRequired,
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
				{ this.props.translate( 'Version %s', { args: this.props.version } ) }
			</div>
			: null;
	}
} );

export default localize( Version );
