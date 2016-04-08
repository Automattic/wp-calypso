/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

var SidebarFooter = require( 'layout/sidebar/footer' );
import Button from 'components/button';

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
				<SidebarFooter>
					{ this.props.footerButton }
					<li><Button compact borderless href="https://en.support.wordpress.com/" target="_blank">{ this.translate( 'Help' ) }</Button></li>
				</SidebarFooter>
			</ul>
		);
	}
} );
