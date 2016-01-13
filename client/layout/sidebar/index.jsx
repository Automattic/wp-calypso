/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export default React.createClass( {
	displayName: 'Sidebar',

	propTypes: {
		className: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	render: function() {
		return (
			<ul className={ classNames( 'sidebar', this.props.className ) } onClick={ this.props.onClick }>
				{ this.props.children }
			</ul>
		);
	}
} );
